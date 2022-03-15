import { Component } from 'react';

import { Route } from '../../../common/navigation';
import { registryRoute } from '../../registry_page';
import { rsvpRoute } from '../../rsvp_page';

import './home_page.scss';

export class HomePage extends Component {
  private readonly groomsName = 'SAM';
  private readonly bridesName = 'STEPHANIE';
  private readonly subtitle = 'June 3rd, 2023 5:00PM | ' +
    'Malibou Lake Lodge, Agoura Hills, CA';

  private readonly backgroundImageUrl =
  `url(${ `${ process.env.PUBLIC_URL }/main_background.jpg` })`;

  public render(): JSX.Element {
    return (
      <div className='home-container'
           style={{ backgroundImage: this.backgroundImageUrl }}>
        <div className='main-content'>
          <header className='title'>
            <span>
              { this.groomsName }
            </span>
            <span className='handwriting'>
              &
            </span>
            <span>
              { this.bridesName }
            </span>
          </header>
          <div className='subtitle'>
            { this.subtitle }
          </div>
          <a className='button primary'>
            { rsvpRoute.title }
          </a>
          <a className='button'>
            { registryRoute.title }
          </a>
        </div>
      </div>
    );
  }
}

export const homeRoute = new Route('Home', HomePage, '/');

