import { rsvpServiceContext, RsvpService } from '@services/rsvp';
import { act, cleanup, render } from '@testing-library/react';
import { setUpRsvpPageJest } from '@views/rsvp_page/testing';
import { AddressAutocomplete } from '@widgets/address_autocomplete';
import { maximumErrorCount, RsvpFinder } from '@widgets/rsvp_finder';

import type { Rsvp } from '@models';

const mockNavigate = jest.fn();

jest.mock('@widgets/address_autocomplete');
jest.mock('@services/rsvp');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const MockAddressAutocomplete = AddressAutocomplete as jest.MockedFunction<
  typeof AddressAutocomplete
>;
const MockRsvpService = RsvpService as jest.MockedClass<typeof RsvpService>;

describe(RsvpFinder.name, () => {
  let selectAddress: (placeId: string) => void | Promise<void>;
  let isDisabled: boolean | undefined;
  let errorText: string | undefined;

  beforeAll(() => {
    setUpRsvpPageJest();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    MockAddressAutocomplete.mockImplementation((props) => {
      selectAddress = props.onSubmission;
      isDisabled = props.disabled;
      errorText = props.errorText;

      return <div />;
    });

    render(
      <rsvpServiceContext.Provider value={new MockRsvpService()}>
        <RsvpFinder />
      </rsvpServiceContext.Provider>,
    );
  });

  afterEach(cleanup);

  test('fetches the RSVP with the selected place ID', async () => {
    await act(() => selectAddress('place id'));

    expect(MockRsvpService.prototype.fetchRsvps).toBeCalledWith('place id');
  });

  test('navigates to the RSVP page with the fetched RSVPs', async () => {
    const rsvp: Rsvp = {
      id: 'place id',
      email: 'email',
      guests: [],
      canHavePlusOne: true,
    };

    MockRsvpService.prototype.fetchRsvps.mockResolvedValue([rsvp]);

    await act(() => selectAddress('place id'));

    expect(mockNavigate).toHaveNavigatedToRsvpPageWith([rsvp]);
  });

  test('is disabled while RSVP fetch is in-flight', () => {
    MockRsvpService.prototype.fetchRsvps.mockImplementation(
      async (_) =>
        new Promise((__, ___) => {
          // Never resolve.
        }),
    );

    act(() => {
      selectAddress('place id');
    });

    expect(isDisabled).toBe(true);
  });

  describe('displays an error', () => {
    test('if the RSVP fetch fails', async () => {
      MockRsvpService.prototype.fetchRsvps.mockRejectedValue(
        Error('Intentional test error'),
      );

      await act(() => selectAddress('place id'));

      expect(errorText).toEqual(expect.stringContaining('error'));
    });

    test('containing instructions to contact the bride or groom if too many errors have occurred', async () => {
      MockRsvpService.prototype.fetchRsvps.mockRejectedValue(
        Error('Intentional test error'),
      );

      async function generateError(): Promise<void> {
        await act(() => selectAddress('place id'));
      }
      for (let count = 0; count < maximumErrorCount + 1; count++) {
        // Sequential calls are intended.
        // eslint-disable-next-line no-await-in-loop
        await generateError();
      }

      expect(errorText).toEqual(expect.stringContaining('text'));
    });
  });
});
