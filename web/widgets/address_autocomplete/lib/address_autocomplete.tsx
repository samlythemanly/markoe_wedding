/* eslint-disable react/jsx-props-no-spreading */
import { debounce } from '@common/async';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { autocompleteServiceContext } from '@services/google_maps';
import parse from 'autosuggest-highlight/parse';
import React from 'react';

import type {
  AutocompleteRenderInputParams,
  InputBaseComponentsPropsOverrides,
  TooltipComponentsPropsOverrides,
} from '@mui/material';

import { AutocompleteList } from './src/autocomplete_list';
import { PoweredByGoogle } from './src/powered_by_google';

type Prediction = google.maps.places.AutocompletePrediction;

interface AddressAutocompleteProps {
  /**
   * Executed whenever a chosen autocompletion result is submitted.
   */
  onSubmission: (placeId: string) => void | Promise<void>;

  /**
   * An optional error to display on the input search box.
   */
  errorText?: string;

  /**
   * Whether to disable the input and submit button.
   */
  disabled?: boolean;
}

/**
 * Test IDs for unit tests using the address autocomplete component.
 */
export enum AddressAutocompleteTestId {
  input = 'autocomplete-input',
  loading = 'autocomplete-loading',
  noResults = 'autocomplete-no-results',
  prediction = 'autocomplete-prediction',
  submitButton = 'autocomplete-submit-button',
  submitButtonTooltip = 'autocomplete-submit-button-tooltip',
}

/**
 * Autocompleting search input which retrieves address results from Google Maps.
 */
export function AddressAutocomplete(
  props: AddressAutocompleteProps,
): JSX.Element {
  const autocompleteService = React.useContext(autocompleteServiceContext)!;
  const debounceDuration = 500;
  const createSessionToken = React.useCallback(
    () => new google.maps.places.AutocompleteSessionToken(),
    [],
  );
  const query = React.useRef('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selection, setSelection] = React.useState<Prediction | null>(null);
  const [inputText, setInputText] = React.useState('');
  const [sessionToken, setSessionToken] = React.useState(createSessionToken);
  const [predictions, setPredictions] = React.useState<Prediction[]>([]);
  const optionLabel = React.useCallback(
    (option: string | Prediction) =>
      typeof option === 'string' ? option : option.description,
    [],
  );
  const [isVisible, setVisible] = React.useState(false);

  /**
   * Returns predictions for the given input from the Google Maps Places API.
   */
  const fetchPredictions = React.useCallback<
    (parameters: {
      inputText: string;
      sessionToken: google.maps.places.AutocompleteSessionToken;
    }) => Promise<google.maps.places.AutocompleteResponse | null>
  >(
    debounce(
      async (parameters: {
        inputText: string;
        sessionToken: google.maps.places.AutocompleteSessionToken;
      }) =>
        autocompleteService.getPlacePredictions({
          input: parameters.inputText,
          sessionToken: parameters.sessionToken,
        }),
      debounceDuration,
    ),
    [],
  );

  /**
   * Marks the autocomplete dropdown as open.
   */
  const setOpen = React.useCallback(() => {
    setVisible(true);
  }, []);
  /**
   * Marks the autocomplete dropdown as closed.
   */
  const setClosed = React.useCallback(() => setVisible(false), []);

  const updateSelection = React.useCallback(
    (_: unknown, newSelection: Prediction | null) => {
      setPredictions(newSelection ? [newSelection] : []);
      setSelection(newSelection);
    },
    [],
  );

  /**
   * Updates the input text to the given value.
   *
   * Also clears the current selection, since it is no longer relevant.
   */
  const updateInput = React.useCallback((_: unknown, input: string) => {
    setInputText(input);
    setSelection(null);
  }, []);

  /**
   * Renders the input text box which is used to query autocomplete results.
   */
  const renderInput = React.useCallback(
    (inputProps: AutocompleteRenderInputParams) => (
      <TextField
        {...inputProps}
        error={props.errorText !== undefined}
        FormHelperTextProps={{
          sx: {
            // Static height such that the UI doesn't jitter when the error text
            // appears.
            height: '21px',
            fontSize: '13px',
          },
        }}
        helperText={props.errorText}
        InputProps={{
          ...inputProps.InputProps,
          componentsProps: {
            input: {
              'data-testid': AddressAutocompleteTestId.input,
            } as InputBaseComponentsPropsOverrides,
          },
          endAdornment: (
            <React.Fragment>
              {isLoading ? <CircularProgress size={20} /> : null}
              {inputProps.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        label="Address"
        sx={{
          paddingBottom: props.errorText ? 0 : 3,
        }}
      />
    ),
    [isLoading, props.errorText],
  );

  /**
   * Returns a prediction fetched from the autocomplete service.
   */
  const renderPrediction = React.useCallback(
    (
      predictionProps: React.HTMLAttributes<HTMLLIElement> & {
        'data-option-index'?: number;
      },
      prediction: Prediction,
    ) => {
      const matches =
        prediction.structured_formatting.main_text_matched_substrings;

      const parts = parse(
        prediction.structured_formatting.main_text,
        matches.map((match) => [match.offset, match.offset + match.length]),
      );

      return (
        <li
          {...predictionProps}
          data-testid={AddressAutocompleteTestId.prediction}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item display="flex">
              <LocationOnIcon sx={{ color: 'text.secondary' }} />
            </Grid>
            <Grid item>
              {parts.map((part, index) => (
                <Box
                  key={index}
                  component="span"
                  sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                >
                  {part.text}
                </Box>
              ))}
              <Typography variant="body2" color="text.secondary">
                {prediction.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        </li>
      );
    },
    [],
  );

  /**
   * Emits the chosen autocompletion result to the consuming component.
   */
  const submitPlace = React.useCallback(() => {
    if (!selection) return;

    props.onSubmission(selection.place_id);

    // Reset the session token.
    setSessionToken(createSessionToken);
  }, [selection, props.onSubmission]);

  // Updates the available predictions to be chosen based on the given input
  // text.
  React.useEffect(() => {
    if (
      inputText === query.current ||
      inputText === selection?.description ||
      !isVisible
    ) {
      return;
    }

    query.current = inputText;

    if (inputText === '') {
      setPredictions(selection ? [selection] : []);
      setIsLoading(false);

      return;
    }

    setIsLoading(true);

    async function updatePredictions(): Promise<void> {
      const response = await fetchPredictions({ inputText, sessionToken });

      // Prevent earlier calls from potentially overwriting fresher results.
      if (inputText === query.current) {
        setPredictions(response?.predictions ?? []);
        setIsLoading(false);
      }
    }

    updatePredictions();
  }, [inputText, isVisible]);

  return (
    <Grid container direction="column" alignItems="center" spacing={2}>
      <Grid item container>
        <Autocomplete
          autoComplete
          clearOnBlur={false}
          disabled={props.disabled}
          fullWidth
          getOptionLabel={optionLabel}
          includeInputInList
          ListboxComponent={AutocompleteList}
          loading={isLoading}
          loadingText={
            <div data-testid={AddressAutocompleteTestId.loading}>
              <PoweredByGoogle innerText="Loading..." />
            </div>
          }
          noOptionsText={
            <div data-testid={AddressAutocompleteTestId.noResults}>
              <PoweredByGoogle
                innerText={inputText && !isLoading ? 'No addresses found' : ''}
              />
            </div>
          }
          onOpen={setOpen}
          onClose={setClosed}
          onChange={updateSelection}
          onInputChange={updateInput}
          options={predictions}
          renderInput={renderInput}
          renderOption={renderPrediction}
          value={selection}
        />
      </Grid>
      <Grid item>
        <Tooltip
          componentsProps={{
            tooltip: {
              'data-testid': AddressAutocompleteTestId.submitButtonTooltip,
            } as TooltipComponentsPropsOverrides,
          }}
          title={
            !selection
              ? 'Please select an address from the input box above'
              : 'Submit address'
          }
        >
          {
            // An empty div is needed since disabled buttons don't fire events,
            // which the tooltip component uses to determine whether it should
            // be visible.
          }
          <div>
            <Button
              data-testid={AddressAutocompleteTestId.submitButton}
              onClick={submitPlace}
              variant="outlined"
              disabled={(props.disabled ?? false) || !selection}
            >
              Submit
            </Button>
          </div>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
