
import { Component } from 'react';

import { Route } from '../../../common/navigation';

export class OurStoryPage extends Component {
  public render(): JSX.Element {
    return (
      <div>
        Our story
      </div>
    );
  }
}

export const ourStoryRoute = new Route('Our story', OurStoryPage);
