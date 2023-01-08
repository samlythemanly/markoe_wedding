import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Enables users to look up their RSVP and make edits to them.
 */
export function RsvpPage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Rsvp
    </Box>
  );
}

export const rsvpRoute = new Route('RSVP', RsvpPage);
