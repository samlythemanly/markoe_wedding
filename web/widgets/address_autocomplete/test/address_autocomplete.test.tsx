/* eslint-disable camelcase */

import { autocompleteServiceContext } from '@services/google_maps';
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';
import {
  AddressAutocomplete,
  AddressAutocompleteTestId,
} from '@widgets/address_autocomplete';

import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

import { poweredByGoogleTestId } from '../lib/powered_by_google';

let submittedPlaceId: string | undefined;
function submit(placeId: string): void {
  submittedPlaceId = placeId;
}

const AutocompleteSessionToken = jest.fn();

window.google = {
  maps: {
    places: {
      AutocompleteSessionToken,
    },
  } as unknown as typeof google.maps,
};

export async function assertNever(callable: () => unknown): Promise<void> {
  await expect(async () => waitFor(callable)).rejects.toEqual(
    expect.anything(),
  );
}

describe(AddressAutocomplete.name, () => {
  let user: UserEvent;
  const autocompleteService = {
    getPlacePredictions: jest.fn(),
  };

  function createPrediction(parameters: {
    address: string;
    id?: string;
  }): google.maps.places.AutocompletePrediction {
    return {
      description: parameters.address,
      matched_substrings: [],
      place_id: parameters.id ?? parameters.address,
      structured_formatting: {
        main_text: parameters.address,
        main_text_matched_substrings: [],
        secondary_text: '',
      },
      terms: [],
      types: [],
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    let tokenCount = 0;
    AutocompleteSessionToken.mockImplementation(() => ({ id: tokenCount++ }));

    submittedPlaceId = undefined;

    const autocomplete =
      autocompleteService as unknown as google.maps.places.AutocompleteService;

    autocompleteService.getPlacePredictions.mockImplementation(async (_) =>
      Promise.resolve({
        predictions: [createPrediction({ address: 'address' })],
      }),
    );

    render(
      <autocompleteServiceContext.Provider value={autocomplete}>
        <AddressAutocomplete onSubmission={submit} />
      </autocompleteServiceContext.Provider>,
    );
  });

  afterEach(cleanup);

  test('calls the autocomplete service with entered text', async () => {
    const input = screen.getByTestId(AddressAutocompleteTestId.input);

    await user.type(input, 'address');

    await waitFor(() =>
      expect(autocompleteService.getPlacePredictions).toBeCalledWith(
        expect.objectContaining({ input: 'address' }),
      ),
    );
  });

  test('does NOT call the autocomplete service with initial empty query', () => {
    expect(autocompleteService.getPlacePredictions).toHaveBeenCalledTimes(0);
  });

  test(
    'does NOT call the autocomplete service with empty text after a query ' +
      'has been executed',
    async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      await screen.findByTestId(AddressAutocompleteTestId.prediction);

      await user.clear(input);

      expect(autocompleteService.getPlacePredictions).toHaveBeenCalledTimes(1);
    },
  );

  test('does NOT emit place ID on selection without submission', async () => {
    const input = screen.getByTestId(AddressAutocompleteTestId.input);

    await user.type(input, 'address');
    const option = await screen.findByTestId(
      AddressAutocompleteTestId.prediction,
    );
    await user.click(option);

    expect(submittedPlaceId).toBeUndefined();
  });

  describe('session tokens', () => {
    test('are newly generated after submission', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      const option = await screen.findByTestId(
        AddressAutocompleteTestId.prediction,
      );
      await user.click(option);

      const submitButton = screen.getByTestId(
        AddressAutocompleteTestId.submitButton,
      );
      await user.click(submitButton);
      await user.type(input, 'other address');
      await screen.findByTestId(AddressAutocompleteTestId.noResults);

      const tokens = autocompleteService.getPlacePredictions.mock.calls.map(
        (call) => call[0].sessionToken,
      );
      expect(tokens).toHaveLength(2);
      expect(new Set(tokens).size).toEqual(2);
    });

    test('are NOT newly generated if no place was submitted', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      const option = await screen.findByTestId(
        AddressAutocompleteTestId.prediction,
      );
      await user.click(option);
      await user.clear(input);

      await user.type(input, 'other address');
      await screen.findByTestId(AddressAutocompleteTestId.noResults);

      const tokens = autocompleteService.getPlacePredictions.mock.calls.map(
        (call) => call[0].sessionToken,
      );
      expect(tokens).toHaveLength(2);
      expect(new Set(tokens).size).toEqual(1);
    });
  });

  describe('search results', () => {
    test('are displayed from the autocomplete service', async () => {
      autocompleteService.getPlacePredictions.mockImplementation(async (_) =>
        Promise.resolve({
          predictions: [
            createPrediction({ address: 'address 1' }),
            createPrediction({ address: 'address 2' }),
          ],
        }),
      );
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');

      const results = await screen.findAllByTestId(
        AddressAutocompleteTestId.prediction,
      );

      screen.debug();
      expect(results.map((result) => result.textContent)).toEqual([
        'address 1',
        'address 2',
      ]);
    });

    test('are NOT displayed when the input is unfocused', async () => {
      autocompleteService.getPlacePredictions.mockImplementation(async (_) =>
        Promise.resolve({
          predictions: [createPrediction({ address: 'address' })],
        }),
      );
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      user.tab();

      const results = screen.queryAllByTestId(
        AddressAutocompleteTestId.prediction,
      );
      expect(results).toHaveLength(0);
    });

    test('empty message is NOT displayed if the input text is empty', () => {
      const results = screen.queryByTestId(AddressAutocompleteTestId.noResults);
      expect(results).toBeNull();
    });

    test('displays empty message if none are available', async () => {
      autocompleteService.getPlacePredictions.mockImplementation(async (_) =>
        Promise.resolve({
          predictions: [],
        }),
      );
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');

      await waitFor(() => {
        const noResults = screen.queryByTestId(
          AddressAutocompleteTestId.noResults,
        );
        expect(noResults).not.toBeNull();
      });
    });

    describe('when request is in-flight', () => {
      let dispose: (_: unknown) => void;

      beforeEach(async () => {
        dispose = (_) => undefined;
        autocompleteService.getPlacePredictions.mockImplementation(
          async (_) =>
            new Promise((resolve, __) => {
              dispose = resolve;
            }),
        );
        const input = screen.getByTestId(AddressAutocompleteTestId.input);

        await user.type(input, 'address');
      });

      afterEach(() => {
        dispose(null);
      });

      test('displays loading text', () => {
        const loading = screen.queryByTestId(AddressAutocompleteTestId.loading);
        expect(loading).not.toBeNull();
      });

      test('does NOT display empty message', () => {
        const noResults = screen.queryByTestId(
          AddressAutocompleteTestId.noResults,
        );
        expect(noResults).toBeNull();
      });
    });

    test('does NOT display empty message if no query has been entered', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');

      const noResults = screen.queryByTestId(
        AddressAutocompleteTestId.noResults,
      );
      expect(noResults).toBeNull();
    });

    test('displays the Powered by Google logo', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      user.click(input);

      await waitFor(() => {
        const logo = screen.queryByTestId(poweredByGoogleTestId);
        expect(logo).not.toBeNull();
      });
    });
  });

  describe('submit button', () => {
    beforeEach(() => {
      autocompleteService.getPlacePredictions.mockImplementation(async (_) =>
        Promise.resolve({
          predictions: [createPrediction({ address: 'address', id: 'id' })],
        }),
      );
    });

    test('is disabled if nothing has been entered in the input', () => {
      const submitButton = screen.getByTestId(
        AddressAutocompleteTestId.submitButton,
      );
      expect(submitButton).toBeDisabled();
    });

    describe('tooltip', () => {
      test('is displayed when the button is disabled', async () => {
        const submitButton = screen.getByTestId(
          AddressAutocompleteTestId.submitButton,
        );

        await user.hover(submitButton);

        await waitFor(() => {
          const tooltip = screen.queryByTestId(
            AddressAutocompleteTestId.submitButtonTooltip,
          );
          expect(tooltip).not.toBeNull();
        });
      });

      test('is NOT displayed when the button is enabled', async () => {
        const input = screen.getByTestId(AddressAutocompleteTestId.input);

        await user.type(input, 'address');
        const option = await screen.findByTestId(
          AddressAutocompleteTestId.prediction,
        );
        await user.click(option);

        const submitButton = screen.getByTestId(
          AddressAutocompleteTestId.submitButton,
        );
        await user.hover(submitButton);

        await assertNever(() => {
          const tooltip = screen.queryByTestId(
            AddressAutocompleteTestId.submitButtonTooltip,
          );
          expect(tooltip).not.toBeNull();
        });
      });
    });

    test('is disabled an option is not selected after searching', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      await screen.findByTestId(AddressAutocompleteTestId.prediction);

      const submitButton = screen.getByTestId(
        AddressAutocompleteTestId.submitButton,
      );
      expect(submitButton).toBeDisabled();
    });

    test('is enabled if an option is selected', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');
      const option = await screen.findByTestId(
        AddressAutocompleteTestId.prediction,
      );
      await user.click(option);

      const submitButton = screen.getByTestId(
        AddressAutocompleteTestId.submitButton,
      );
      expect(submitButton).toBeEnabled();
    });

    test('emits the submitted place id on click', async () => {
      const input = screen.getByTestId(AddressAutocompleteTestId.input);

      await user.type(input, 'address');

      const option = await screen.findByTestId(
        AddressAutocompleteTestId.prediction,
      );
      await user.click(option);
      const submitButton = screen.getByTestId(
        AddressAutocompleteTestId.submitButton,
      );
      await user.click(submitButton);

      expect(submittedPlaceId).toEqual('id');
    });
  });
});
