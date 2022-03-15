
import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class DressCodePage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        Dress
      </div>
    );
  }
}

export const dressCodeRoute = new Route('Dress code', DressCodePage);
