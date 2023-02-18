import { Container } from '@mui/material';

import type { Rsvp } from '@models';

interface RsvpEditorProps {
  /**
   * The RSVP to edit.
   */
  rsvp: Rsvp;
}

export const RsvpEditor = (props: RsvpEditorProps): JSX.Element => (
  <Container>{JSON.stringify(props.rsvp)}</Container>
);
