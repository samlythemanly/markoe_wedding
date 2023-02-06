import poweredByGoogleImage from '@assets/powered_by_google.png';
import { Box } from '@mui/material';

/**
 * Test ID for unit tests using the powered by Google component.
 */
export const poweredByGoogleTestId = 'powered-by-google';

/**
 * The "Powered by Google" image required to be displayed when using Google Maps
 * Places autocomplete.
 */
export function PoweredByGoogle(props: { innerText?: string }): JSX.Element {
  return (
    <Box
      data-testid={poweredByGoogleTestId}
      display="flex"
      alignItems="center"
      flex={1}
      justifyContent="center"
      minHeight="32px"
    >
      <Box display="flex" flex={1}>
        {props.innerText ?? ''}
      </Box>
      <img style={{ width: '30%', height: '30%' }} src={poweredByGoogleImage} />
    </Box>
  );
}
