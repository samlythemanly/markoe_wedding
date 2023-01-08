import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Cute information regarding how the bridge and groom met.
 */
export function OurStoryPage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Our story
    </Box>
  );
}

export const ourStoryRoute = new Route('Our story', OurStoryPage);
