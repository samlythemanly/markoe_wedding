import { Route } from '@common/navigation';
import { RsvpSelector } from '@widgets/rsvp_selector';
import React from 'react';

import type { Rsvp } from '@models';

export function RsvpPage(): JSX.Element {
  const [_, setRsvp] = React.useState<Rsvp>();

  return <RsvpSelector onRetrieval={setRsvp} />;
}

export const rsvpRoute = new Route('RSVP', RsvpPage);
