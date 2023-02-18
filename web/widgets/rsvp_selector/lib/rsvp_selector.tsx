import { Box, Grid, Typography } from '@mui/material';
import { useNavigateWithRsvps } from '@views/rsvp_page';
import * as React from 'react';

import type { Rsvp } from '@models';

import { RsvpSummary } from './src/rsvp_summary';

interface RsvpSelectorProps {
  /**
   * The RSVPs to select between.
   */
  rsvps: Rsvp[];
}

/**
 * Given several RSVPs, presents the user a list to select between them.
 */
export const RsvpSelector = (props: RsvpSelectorProps): JSX.Element => {
  const navigateWithRsvps = useNavigateWithRsvps();

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      display="flex"
      minHeight="100vh"
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography
            alignItems="center"
            display="flex"
            flex={1}
            flexDirection="column"
            variant="h5"
          >
            <Box>
              Looks like there were several invitations sent to this address!
            </Box>
            <Box>Please select the option which includes your name</Box>
          </Typography>
        </Grid>
        <Grid item container>
          <Grid alignItems="center" container direction="column" spacing={2}>
            {props.rsvps.map((rsvp) => {
              /**
               * Navigates to the RSVP page for the particular RSVP.
               */
              const navigate = React.useCallback(() => {
                navigateWithRsvps([rsvp]);
              }, []);

              return (
                <Grid key={rsvp.id} item>
                  <RsvpSummary rsvp={rsvp} onClick={navigate} />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
