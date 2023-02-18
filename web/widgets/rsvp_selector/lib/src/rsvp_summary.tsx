import { Box, Card, CardActionArea, Typography } from '@mui/material';

import type { Guest, Rsvp } from '@models';

interface RsvpSummaryProps {
  /**
   * The RSVP to summarize.
   */
  rsvp: Rsvp;

  /**
   * Callback for when the card is clicked.
   */
  onClick: () => void;
}

/**
 * Test IDs for unit tests using the RSVP summary component.
 */
export enum RsvpSummaryTestId {
  root = 'summary',
}

/**
 * Formats the guest as their name.
 */
function formatGuest(guest: Guest): string {
  return guest.name;
}

/**
 * Formats a list of guests delimited by commas.
 */
function formatGuests(guests: Guest[]): string {
  const formattedGuests = [...guests].map(formatGuest);

  if (guests.length === 1) return formattedGuests[0];
  if (guests.length === 2) return formattedGuests.join(' and ');

  const lastGuest = formattedGuests.pop();

  return [...formattedGuests, `and ${lastGuest}`].join(', ');
}

/**
 * Clickable card that displays the names of the guests in an RSVP.
 */
export const RsvpSummary = (props: RsvpSummaryProps): JSX.Element => (
  <Card sx={{ borderRadius: 2 }}>
    <CardActionArea
      data-testid={RsvpSummaryTestId.root}
      onClick={props.onClick}
    >
      <Box
        padding={4}
        borderRadius={2}
        border={1}
        borderColor="divider"
        width={500}
      >
        <Typography variant="h6">{formatGuests(props.rsvp.guests)}</Typography>
      </Box>
    </CardActionArea>
  </Card>
);
