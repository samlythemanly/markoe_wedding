
import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class RsvpPage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        RSVP
      </div>
    );
  }
}

export const rsvpRoute = new Route('RSVP', RsvpPage);
