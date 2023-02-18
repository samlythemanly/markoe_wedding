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
  private readonly _fetchRsvps!: HttpsCallable<string, { rsvps: Rsvp[] }>;
  private readonly _upsertRsvp!: HttpsCallable<Partial<Rsvp>, void>;

  public constructor() {
    const app = firebase.initializeApp({
      projectId: process.env.cloudProjectId,
      apiKey: process.env.cloudApiKey,
    });
    const functions = getFunctions(app, process.env.region);

    if (process.env.shouldUseEmulator === 'true') {
      if (!process.env.emulatorPort) {
        throw Error('Port must be specified when using the emulator.');
      }

      console.debug(
        `Connecting to firebase emulator on port ${process.env.emulatorPort}`,
      );

      connectFunctionsEmulator(
        functions,
        'localhost',
        Number.parseInt(process.env.emulatorPort),
      );
    }

    this._fetchRsvps = httpsCallable(functions, 'fetchRsvps');
    this._upsertRsvp = httpsCallable(functions, 'upsertRsvp');
  }

  public async fetchRsvps(id: string): Promise<Rsvp[]> {
    const response = await this._fetchRsvps(id);

    return response.data.rsvps;
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
