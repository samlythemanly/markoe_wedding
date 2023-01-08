import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Displays information for where guests can stay during the wedding.
 */
export function AccommodationsPage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Accommodations
    </Box>
  );
}

export const accommodationsRoute = new Route(
  'Accommodations',
  AccommodationsPage,
);
