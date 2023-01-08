import { Route } from '@common/navigation';
import { Box } from '@mui/material';

/**
 * Contains links to the registry.
 */
export function RegistryPage(): JSX.Element {
  return (
    <Box display="flex" justifyContent="center">
      Registry
    </Box>
  );
}

export const registryRoute = new Route('Registry', RegistryPage);
