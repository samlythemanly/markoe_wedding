import { MealChoice, RsvpStatus } from '@models';
import testFunctions from 'firebase-functions-test';
import { mockFirebaseAdmin } from 'mock-firebase-ts';

import type { PartialRsvp } from '..';
import type { Rsvp } from '@models';
import type { CallableContext } from 'firebase-functions/v1/https';

const { wrap } = testFunctions();

const firebase = mockFirebaseAdmin();
jest.doMock('firebase-admin', () => firebase);

describe('RSVP API', () => {
  afterEach(() => {
    jest.resetAllMocks();
    firebase.firestore().mocker.reset();
  });

  const validContext: Partial<CallableContext> = {
    app: {
      appId: 'id',
      token: {
        iss: 'iss',
        aud: ['aud'],
        iat: 0,
        exp: 0,
        sub: 'sub',
        // eslint-disable-next-line camelcase
        app_id: 'id',
      },
    },
  };

  const invalidContext: Partial<CallableContext> = { app: undefined };

  function stubRsvp(rsvp: PartialRsvp): void {
    firebase.firestore().collection('rsvps').doc(rsvp.id).set([rsvp]);
  }

  describe('fetchRsvps', () => {
    let fetchRsvps: (
      id: string,
      context?: Partial<CallableContext>,
    ) => Promise<Rsvp[]>;

    beforeEach(async () => {
      const library = await import('..');

      fetchRsvps = (id, context = validContext) =>
        wrap(library.fetchRsvps)(id, context);
    });

    describe('returns an error', () => {
      test('when an RSVP with the provided ID does not exist', async () => {
        await expect(fetchRsvps('unknown')).rejects.toThrow(
          expect.objectContaining({ code: 'not-found' }),
        );
      });

      test('when app check is enabled and it fails', async () => {
        await expect(fetchRsvps('id', invalidContext)).rejects.toThrow(
          expect.objectContaining({ code: 'unauthenticated' }),
        );
      });

      test('when the server errors', async () => {
        const getRsvp = jest.spyOn(
          firebase.firestore().collection('rsvps').doc('id'),
          'get',
        );
        getRsvp.mockImplementation(() => {
          throw Error('Intentional test error');
        });

        await expect(fetchRsvps('id')).rejects.toThrow(
          expect.objectContaining({ code: 'internal' }),
        );
      });
    });

    test('returns the RSVPs with the provided ID', async () => {
      const rsvp: PartialRsvp = {
        id: 'rsvp_id',
        email: 'coolguy@coolmail.com',
        status: RsvpStatus.confirmed,
      };
      stubRsvp(rsvp);

      await expect(fetchRsvps(rsvp.id)).resolves.toEqual([rsvp]);
    });
  });

  describe('upsertRsvp', () => {
    let upsertRsvp: (
      rsvp: PartialRsvp,
      context?: Partial<CallableContext>,
    ) => Promise<void>;

    beforeEach(async () => {
      const library = await import('..');

      upsertRsvp = (id, context = validContext) =>
        wrap(library.upsertRsvp)(id, context);
    });

    describe('returns an error', () => {
      test('when app check is enabled and it fails', async () => {
        await expect(upsertRsvp({ id: 'id' }, invalidContext)).rejects.toThrow(
          expect.objectContaining({ code: 'unauthenticated' }),
        );
      });

      test('when the server errors', async () => {
        const setRsvp = jest.spyOn(
          firebase.firestore().collection('rsvps').doc('id'),
          'set',
        );
        setRsvp.mockImplementation(() => {
          throw Error('Intentional test error');
        });

        await expect(upsertRsvp({ id: 'id' })).rejects.toThrow(
          expect.objectContaining({ code: 'internal' }),
        );
      });
    });

    test('updates existing RSVPs', async () => {
      const existingRsvp: PartialRsvp = {
        id: 'id',
        email: 'guest@test.com',
      };
      firebase
        .firestore()
        .collection('rsvps')
        .doc(existingRsvp.id)
        .set(existingRsvp);

      await upsertRsvp({
        id: existingRsvp.id,
        status: RsvpStatus.declined,
      });

      expect(
        firebase
          .firestore()
          .mocker.collection('rsvps')
          .mocker.doc(existingRsvp.id)
          .mocker.getData(),
      ).toEqual({ ...existingRsvp, status: RsvpStatus.declined });
    });

    test('creates new RSVPs', async () => {
      const rsvp: Rsvp = {
        id: 'id',
        email: 'guest@test.com',
        guests: [
          {
            name: 'guest',
            mealChoice: MealChoice.vegan,
            isPlusOne: true,
          },
        ],
        status: RsvpStatus.confirmed,
        canHavePlusOne: true,
      };

      await upsertRsvp(rsvp);

      const data = firebase
        .firestore()
        .mocker.collection('rsvps')
        .mocker.doc(rsvp.id)
        .mocker.getData() as PartialRsvp;
      expect(data).toEqual(rsvp);
    });
  });
});
