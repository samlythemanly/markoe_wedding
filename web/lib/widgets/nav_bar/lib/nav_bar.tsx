import { makeEventKey } from '@restart/ui/SelectableContext';
import { Navbar, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { accommodationsRoute } from '../../accommodations_page';
import { dressCodeRoute } from '../../dress_code_page';
import { gettingThereRoute } from '../../getting_there_page';
import { homeRoute } from '../../home_page';
import { ourStoryRoute } from '../../our_story_page';
import { registryRoute } from '../../registry_page';
import { rsvpRoute } from '../../rsvp_page';

import styles from './nav_bar.module.scss';

//
/* eslint-disable react/forbid-component-props */
export function NavBar(): JSX.Element {
  const orderedRoutes = [
    homeRoute,
    ourStoryRoute,
    gettingThereRoute,
    accommodationsRoute,
    dressCodeRoute,
    rsvpRoute,
    registryRoute,
  ].map((route) => (
    <LinkContainer key={route.title} to={route.path}>
      <Nav.Link key={makeEventKey(route.title)}>
        <div className={styles.item}>{route.title}</div>
      </Nav.Link>
    </LinkContainer>
  ));

  return (
    <div className={styles.container}>
      <Navbar
        expand="lg"
        variant="dark"
        className={styles.nav}
        collapseOnSelect>
        <Navbar.Toggle className={styles.toggle} />
        <Navbar.Offcanvas className={styles.sidebar}>
          <Nav className={styles.items}>{orderedRoutes}</Nav>
        </Navbar.Offcanvas>
      </Navbar>
    </div>
  );
}
