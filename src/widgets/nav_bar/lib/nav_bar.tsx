import { Component } from 'react';
import { Link } from 'react-router-dom';

import {
  accommodationsRoute,
  dressCodeRoute,
  gettingThereRoute,
  ourStoryRoute,
  registryRoute,
  rsvpRoute,
} from '../../../common/navigation';

import './nav_bar.scss';

export class NavBar extends Component {
  private readonly rsvpText = 'RSVP';
  private readonly registryText = 'REGISTRY';
  private readonly storyText = 'OUR STORY';
  private readonly gettingThereText = 'GETTING THERE';
  private readonly accommodationsText = 'ACCOMMODATIONS';
  private readonly dressCodeText = 'DRESS CODE';


  public render(): JSX.Element {
    return (
      <div className='container'>
        <div className='spacer' />
        <div className='items'>
          <Link to={ ourStoryRoute }>
            { this.storyText }
          </Link>
          <Link to={ gettingThereRoute }>
            { this.gettingThereText }
          </Link>
          <Link to={ accommodationsRoute }>
            { this.accommodationsText }
          </Link>
          <Link to={ dressCodeRoute }>
            { this.dressCodeText }
          </Link>
          <Link to={ rsvpRoute }>
            { this.rsvpText }
          </Link>
          <Link to={ registryRoute }>
            { this.registryText }
          </Link>
        </div>
        <div className='spacer' />
      </div>
    );
  }
}
