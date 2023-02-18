import { Box, Grid, Typography } from '@mui/material';
import { rsvpServiceContext } from '@services/rsvp';
import { useNavigateWithRsvps } from '@views/rsvp_page';
import { AddressAutocomplete } from '@widgets/address_autocomplete';
import React from 'react';

/**
 * The maximum amount of errors allowed before a message is shown to the user
 * instructing them to contact the bride or groom.
 */
export const maximumErrorCount = 2;

/**
 * Finds a user's RSVP via the address to which their invitation was sent.
 */
export function RsvpFinder(): JSX.Element {
  const rsvpService = React.useContext(rsvpServiceContext)!;
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const [errorCount, setErrorCount] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const navigateWithRsvps = useNavigateWithRsvps();

  const tooManyErrorsMessage =
    'Looks like something is going wrong. Please text ' +
    `${process.env.groomName} at ${process.env.groomPhoneNumber} or ` +
    `${process.env.brideName} at ${process.env.bridePhoneNumber} sort it out!`;

  /**
   * Fetches RSVPs from the RSVP service, and then attempts to navigate to the
   * RSVP page for them.
   */
  const fetchRsvps = React.useCallback(
    async (selectedId: string): Promise<void> => {
      setErrorMessage(undefined);

      try {
        setLoading(true);
        const rsvps = await rsvpService.fetchRsvps(selectedId);

        if (rsvps.length === 0) {
          setErrorCount(errorCount + 1);
          setErrorMessage('RSVP not found');

          return;
        }

        navigateWithRsvps(rsvps);
      } catch {
        setErrorCount(errorCount + 1);
        setErrorMessage('An unknown error occurred. Please try again');
      } finally {
        setLoading(false);
      }
    },
    [errorCount],
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
            <AddressAutocomplete
              disabled={isLoading}
              errorText={
                errorCount > maximumErrorCount
                  ? tooManyErrorsMessage
                  : errorMessage
              }
              onSubmission={fetchRsvps}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
