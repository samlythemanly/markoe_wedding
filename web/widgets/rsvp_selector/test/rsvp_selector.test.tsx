import { RsvpStatus } from '@models';
import { Snackbar } from '@mui/material';
import { rsvpServiceContext, RsvpService } from '@services/rsvp';
import { cleanup, render } from '@testing-library/react';
import { AddressAutocomplete } from '@widgets/address_autocomplete';
import { RsvpSelector } from '@widgets/rsvp_selector';

import type { Rsvp } from '@models';

jest.mock('@widgets/address_autocomplete');
jest.mock('@services/rsvp');
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');

  return {
    ...actual,
    Snackbar: jest.fn(),
  };
});

const MockAddressAutocomplete = AddressAutocomplete as jest.MockedFunction<
  typeof AddressAutocomplete
>;
const MockSnackbar = Snackbar as jest.MockedFunction<typeof Snackbar>;
const MockRsvpService = RsvpService as jest.MockedClass<typeof RsvpService>;

let retrievedRsvp: Rsvp | undefined;
function markRetrieved(rsvp: Rsvp): void {
  retrievedRsvp = rsvp;
}

describe(RsvpSelector.name, () => {
  let selectAddress: (placeId: string) => void;

  beforeEach(() => {
    jest.resetAllMocks();
    retrievedRsvp = undefined;

    MockAddressAutocomplete.mockImplementation((props) => {
      selectAddress = props.onSubmission;

      return <div />;
    });

    render(
      <rsvpServiceContext.Provider value={new MockRsvpService()}>
        <RsvpSelector onRetrieval={markRetrieved} />
      </rsvpServiceContext.Provider>,
    );
  });

  afterEach(cleanup);

  test('fetches the RSVP with the selected place ID', () => {
    selectAddress('place id');

    expect(MockRsvpService.prototype.fetchRsvp).toBeCalledWith('place id');
  });

  test('emits the fetched RSVP associated with the selected place ID', async () => {
    const rsvp: Rsvp = {
      id: 'place id',
      email: 'email',
      guests: [],
      status: RsvpStatus.pending,
      canHavePlusOne: true,
    };

    MockRsvpService.prototype.fetchRsvp.mockImplementation(async (_: string) =>
      Promise.resolve(rsvp),
    );

    selectAddress('place id');

    expect(retrievedRsvp).toEqual(rsvp);
  });

  test('displays an error if the RSVP fetch fails', () => {
    MockRsvpService.prototype.fetchRsvp.mockImplementation(async (_: string) =>
      Promise.reject(Error('Intentional test error')),
    );

    selectAddress('place id');

    expect(MockSnackbar).toBeCalledWith(
      expect.objectContaining({
        open: true,
        message: 'Intentional test error',
      }),
      expect.anything(),
    );
  });
});
