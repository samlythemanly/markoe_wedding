import { Route } from '@common/navigation';
import { RsvpEditor } from '@widgets/rsvp_editor';
import { RsvpFinder } from '@widgets/rsvp_finder';
import { RsvpSelector } from '@widgets/rsvp_selector';
import { useLocation, useNavigate } from 'react-router-dom';

import type { Rsvp } from '@models';

/**
 * Allows users to select and edit their RSVP.
 */
export function RsvpPage(): JSX.Element {
  const location = useLocation();
  const rsvps: Rsvp[] = location.state?.rsvps ?? [];

  if (rsvps.length === 0) {
    return <RsvpFinder />;
  }

  if (rsvps.length > 1) {
    return <RsvpSelector rsvps={rsvps} />;
  }

  return <RsvpEditor rsvp={rsvps[0]} />;
}

export const rsvpRoute = new Route('RSVP', RsvpPage);

/**
 * Navigation hook to navigate to the RSVP page with fetched data.
 */
export function useNavigateWithRsvps(): (rsvps: Rsvp[]) => void {
  const navigate = useNavigate();

  return (rsvps: Rsvp[]) => navigate(rsvpRoute.path, { state: { rsvps } });
}
