import * as firebase from 'firebase/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import React from 'react';

import type { Rsvp } from '@models';
import type { HttpsCallable } from 'firebase/functions';

/**
 * Fetches and modifies RSVPs.
 */
export class RsvpService {
  private readonly _fetchRsvp!: HttpsCallable<string, Rsvp>;
  private readonly _upsertRsvp!: HttpsCallable<Partial<Rsvp>, void>;

  public constructor() {
    const app = firebase.initializeApp({
      projectId: process.env.CLOUD_PROJECT_ID,
      apiKey: process.env.CLOUD_API_KEY,
    });
    const functions = getFunctions(app, process.env.REGION);

    if (process.env.SHOULD_USE_EMULATOR === 'true') {
      if (!process.env.EMULATOR_PORT) {
        throw Error('Port must be specified when using the emulator.');
      }

      console.debug(
        `Connecting to firebase emulator on port ${process.env.EMULATOR_PORT}`,
      );

      connectFunctionsEmulator(
        functions,
        'localhost',
        Number.parseInt(process.env.EMULATOR_PORT),
      );
    }

    this._fetchRsvp = httpsCallable(functions, 'fetchRsvp');
    this._upsertRsvp = httpsCallable(functions, 'upsertRsvp');
  }

  public async fetchRsvp(id: string): Promise<Rsvp> {
    const response = await this._fetchRsvp(id);

    return response.data;
  }

  public async upsertRsvp(
    rsvp: Omit<Partial<Rsvp>, 'id'> & { id: string },
  ): Promise<void> {
    await this._upsertRsvp(rsvp);
  }
}

export const rsvpServiceContext = React.createContext<RsvpService | undefined>(
  undefined,
);
