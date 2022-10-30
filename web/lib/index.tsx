import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import styles from './index.module.scss';
import { accommodationsRoute } from './widgets/accommodations_page';
import { dressCodeRoute } from './widgets/dress_code_page';
import { gettingThereRoute } from './widgets/getting_there_page';
import { homeRoute } from './widgets/home_page';
import { NavBar } from './widgets/nav_bar';
import { ourStoryRoute } from './widgets/our_story_page';
import { registryRoute } from './widgets/registry_page';
import { rsvpRoute } from './widgets/rsvp_page';

const routes = [
  accommodationsRoute,
  dressCodeRoute,
  gettingThereRoute,
  homeRoute,
  ourStoryRoute,
  registryRoute,
  rsvpRoute,
];

const App = (): JSX.Element => {
  const routeRefs = React.useRef(
    Array(routes.length)
      .fill(null)
      .map(() => React.createRef<HTMLDivElement>()),
  );

  return (
    <div className={styles.container}>
      <TransitionGroup component={null}>
        {routes.map(({ path, Page }, index) => {
          const transitionDuration = 600;

          return (
            <Route key={path} path={path} exact>
              {({ match }) => (
                <CSSTransition
                  nodeRef={routeRefs.current[index]}
                  classNames="route-transition"
                  timeout={{
                    appear: transitionDuration / 2,
                    enter: 0,
                    exit: transitionDuration / 2,
                  }}
                  appear
                  unmountOnExit
                  in={match?.path === path}
                >
                  <div ref={routeRefs.current[index]} className={styles.page}>
                    <Page />
                  </div>
                </CSSTransition>
              )}
            </Route>
          );
        })}
      </TransitionGroup>
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  render(
    <React.StrictMode>
      <BrowserRouter>
        <NavBar />
        <App />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
  );
});
