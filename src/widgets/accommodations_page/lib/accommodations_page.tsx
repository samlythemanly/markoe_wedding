import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class AccommodationsPage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        Accommodations
      </div>
    );
  }
}

export const accommodationsRoute =
  new Route('Accommodations', AccommodationsPage);
