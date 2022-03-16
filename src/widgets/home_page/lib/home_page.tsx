import { Component } from 'react';
import { Link } from 'react-router-dom';

import { Route } from '../../../common/navigation';
import { registryRoute } from '../../registry_page';
import { rsvpRoute } from '../../rsvp_page';

import styles from './home_page.module.scss';

export class HomePage extends Component {
  private readonly groomsName = 'SAM';
  private readonly bridesName = 'STEPHANIE';
  private readonly subtitle = 'June 3rd, 2023 5:00PM | ' +
    'Malibou Lake Lodge, Agoura Hills, CA';

  private readonly backgroundImageUrl =
  `url(${ `${ process.env.PUBLIC_URL }/main_background.jpg` })`;

  public render(): JSX.Element {
    return (
      <div className={ styles.container }
           style={{ backgroundImage: this.backgroundImageUrl }}>
        <div className={ styles.mainContent }>
          <header className={ styles.title }>
            <span>
              { this.groomsName }
            </span>
            <span className={ styles.handwriting }>
              &
            </span>
            <span>
              { this.bridesName }
            </span>
          </header>
          <div className={ styles.subtitle }>
            { this.subtitle }
          </div>
          <Link key={ `home-${ rsvpRoute.title }` }
                to={ rsvpRoute.path }
                // eslint-disable-next-line react/forbid-component-props
                className={ `${ styles.button } ${ styles.primary }` }>
            { rsvpRoute.title }
          </Link>
          <Link key={ `home-${ registryRoute.title }` }
                to={ registryRoute.path }
                // eslint-disable-next-line react/forbid-component-props
                className={ styles.button }>
            { registryRoute.title }
          </Link>
        </div>
      </div>
    );
  }
}

export const homeRoute = new Route('Home', HomePage, '/');

