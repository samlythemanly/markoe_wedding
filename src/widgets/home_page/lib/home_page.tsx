import { Component } from 'react';

import './home_page.scss';

export class HomePage extends Component {
  private readonly groomsName = 'SAM';
  private readonly bridesName = 'STEPHANIE';
  private readonly subtitle = 'June 3rd, 2023 5:00PM | ' +
    'Malibou Lake Lodge, Agoura Hills, CA';
  private readonly rsvpText = 'RSVP';
  private readonly registryText = 'REGISTRY';

  private readonly backgroundImage =
  `url(${ `${ process.env.PUBLIC_URL }/main_background.jpg` })`;

  public render(): JSX.Element {
    return (
      <div className='root'
           style={{ backgroundImage: this.backgroundImage }}>
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
            { this.rsvpText }
          </a>
          <a className='button'>
            { this.registryText }
          </a>
        </div>
      </div>
    );
  }
}

