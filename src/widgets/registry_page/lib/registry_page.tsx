
import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class RegistryPage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        Registry
      </div>
    );
  }
}

export const registryRoute = new Route('Registry', RegistryPage);
