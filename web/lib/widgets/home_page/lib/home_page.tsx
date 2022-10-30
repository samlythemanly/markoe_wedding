import { LinkContainer } from 'react-router-bootstrap';

import { Route } from '../../../navigation';
import { registryRoute } from '../../registry_page';
import { rsvpRoute } from '../../rsvp_page';

import styles from './home_page.module.scss';

export function HomePage(): JSX.Element {
  const groomsName = 'Sam';
  const bridesName = 'Stephanie';
  const date = 'June 3rd, 2023 5:00PM';
  const location = 'Malibou Lake Lodge, Agoura Hills, CA';
  const publicUrl = process.env.PUBLIC_URL;
  const backgroundImageUrl = `url(${`${publicUrl}/home_background.jpg`})`;

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.title}>
          <span>{groomsName.toUpperCase()}</span>
          <span className={styles.handwriting}>&</span>
          <span>{bridesName.toUpperCase()}</span>
        </header>
        <span>{date}</span>
        <span>{location}</span>
        <LinkContainer to={rsvpRoute.path}>
          <div className={`${styles.button} ${styles.primary}`}>
            {rsvpRoute.title}
          </div>
        </LinkContainer>
        <LinkContainer to={registryRoute.path}>
          <div className={styles.button}>{registryRoute.title}</div>
        </LinkContainer>
      </div>
      <div className={styles.background} />
      <div
        className={styles.backgroundImage}
        style={{ backgroundImage: backgroundImageUrl }}
      />
    </div>
  );
}

export const homeRoute = new Route('Home', HomePage, '/');
