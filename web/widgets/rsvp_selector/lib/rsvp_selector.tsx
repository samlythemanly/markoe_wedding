import { Box, Grid, Snackbar, Typography } from '@mui/material';
import { rsvpServiceContext } from '@services/rsvp';
import { AddressAutocomplete } from '@widgets/address_autocomplete';
import React from 'react';

import type { Rsvp } from '@models';

interface RsvpSelectorProps {
  onRetrieval: (rsvp: Rsvp) => void;
}

/**
 * Finds a user's RSVP via the address to which their invitation was sent.
 */
export function RsvpSelector(props: RsvpSelectorProps): JSX.Element {
  const rsvpService = React.useContext(rsvpServiceContext)!;
  const [snackbarText, setSnackbarText] = React.useState<string>();
  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);

  const closeSnackbar = React.useCallback(
    () => setIsSnackbarOpen(false),
    [setIsSnackbarOpen],
  );

  const fetchRsvp = React.useCallback(
    async (selectedId: string): Promise<void> => {
      try {
        const rsvp = await rsvpService.fetchRsvp(selectedId);

        props.onRetrieval(rsvp);
      } catch (error) {
        setSnackbarText((error as Error).message);
        setIsSnackbarOpen(true);
      }
    },
    [rsvpService],
  );

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      display="flex"
      minHeight="100vh"
    >
      <Box padding={7} border={1} borderColor="divider" borderRadius={2}>
        <Grid alignItems="center" container direction="column" spacing={4}>
          <Grid
            item
            container
            alignItems="center"
            spacing={1}
            direction="column"
          >
            <Grid item>
              <Typography variant="h4">Find your RSVP</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6">
                Please enter the address to which your invitation was sent
              </Typography>
            </Grid>
          </Grid>
          <Grid item container>
            <AddressAutocomplete onSubmission={fetchRsvp} />
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snackbarText}
      />
    </Box>
  );
}
