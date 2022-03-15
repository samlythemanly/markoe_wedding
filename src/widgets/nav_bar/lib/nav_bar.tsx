import { Component } from 'react';
import { Link } from 'react-router-dom';

import { accommodationsRoute } from '../../accommodations_page';
import { dressCodeRoute } from '../../dress_code_page';
import { gettingThereRoute } from '../../getting_there_page';
import { homeRoute } from '../../home_page';
import { ourStoryRoute } from '../../our_story_page';
import { registryRoute } from '../../registry_page';
import { rsvpRoute } from '../../rsvp_page';

import './nav_bar.scss';

export class NavBar extends Component {
  private static readonly orderedRoutes = [
    homeRoute,
    ourStoryRoute,
    gettingThereRoute,
    accommodationsRoute,
    dressCodeRoute,
    rsvpRoute,
    registryRoute,
  ].map((route) => (
    <Link key={ route.title }
          to={ route.path }>
      { route.title }
    </Link>
  ));

  public render(): JSX.Element {
    return (
      <div className='container'>
        <div className='spacer' />
        <div className='items'>
          { NavBar.orderedRoutes }
        </div>
        <div className='spacer' />
      </div>
    );
  }
}
