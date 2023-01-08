import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Contains directions on how to get to the venue (and recommendations for
 * which paths to avoid),
 */
export function GettingTherePage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Getting there
    </Box>
  );
}

export const gettingThereRoute = new Route('Getting there', GettingTherePage);
