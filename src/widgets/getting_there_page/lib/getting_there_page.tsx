
import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class GettingTherePage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        Getting there
      </div>
    );
  }
}

export const gettingThereRoute = new Route('Getting there', GettingTherePage);
