import fs from 'fs';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import * as firebase from 'firebase-admin';
import { https, region } from 'firebase-functions';

import type { Rsvp } from '@models';
import type { HttpsFunction, Runnable } from 'firebase-functions';
import type { CallableContext } from 'firebase-functions/v1/https';

const app = firebase.initializeApp();
const firestore = app.firestore();

if (fs.existsSync('../.env')) {
  dotenvExpand(dotenv.config({ path: '../.env' }));
}

/**
 * Partial RSVP but with required ID.
 */
export type PartialRsvp = Partial<Omit<Rsvp, 'id'>> & { id: string };

/**
 * Retrieves RSVPs by ID.
 *
 * The ID matches the place ID of the address to which the physical invitations
 * are sent.
 */
async function fetch(id: string): Promise<Rsvp[]> {
  const document = await firestore
    .collection(process.env.rsvpCollection!)
    .doc(id)
    .get();

  if (!document.exists) {
    return [];
  }

  return document.data() as Rsvp[];
}

/**
 * Creates a new RSVP, or updates an entry if one exists already.
 */
async function upsert(rsvp: PartialRsvp): Promise<void> {
  await firestore
    .collection(process.env.rsvpCollection!)
    .doc(rsvp.id)
    .set(rsvp, { merge: true });
}

/**
 * Validates the request is properly formed.
 */
function validateRequest(context: CallableContext): void {
  if (!context.app && process.env.disableAppCheck?.toLowerCase() !== 'true') {
    throw new https.HttpsError('unauthenticated', 'Unauthenticated.');
  }
}

/**
 * Creates an HTTP cloud function with common configuration and validation
 * checks.
 */
function httpFunction<T, S>(
  rsvpFunction: (parameter: T) => Promise<S>,
): HttpsFunction & Runnable<T> {
  return region(process.env.region!)
    .runWith({
      enforceAppCheck: process.env.disableAppCheck?.toLowerCase() !== 'true',
    })
    .https.onCall(async (parameter: T, context: CallableContext) => {
      try {
        validateRequest(context);

        const result = await rsvpFunction(parameter);

        return result;
      } catch (error) {
        if (error instanceof https.HttpsError) {
          throw error;
        } else {
          throw new https.HttpsError(
            'internal',
            'An unknown error occurred.',
            error,
          );
        }
      }
    });
}

export const fetchRsvps = httpFunction<string, Rsvp[]>(fetch);
export const upsertRsvp = httpFunction<PartialRsvp, void>(upsert);
