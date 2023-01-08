import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Describes the expected attire of guests who attend the wedding.
 */
export function DressCodePage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Dress code
    </Box>
  );
}

export const dressCodeRoute = new Route('Dress code', DressCodePage);
