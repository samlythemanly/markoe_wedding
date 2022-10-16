import { Route } from '../../../navigation';

import styles from './rsvp_page.module.scss';

export function RsvpPage(): JSX.Element {
  return (
    <div className={ styles.container }>
      RSVP
    </div>
  );
}

export const rsvpRoute = new Route('RSVP', RsvpPage);
