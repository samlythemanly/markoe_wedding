import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import type { PropsWithChildren } from 'react';

import './common/navigation/route_transitions.scss';
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
].map((route) => (
  <Route key={ route.title }
         path={ route.path }
         element={ <route.Page /> } />
));

const RootContainer =
  (props: PropsWithChildren<Record<string, undefined>>): JSX.Element =>
    (<div className={ styles.container }>
      { props.children }
    </div>);

// eslint-disable-next-line react/no-multi-comp
const App = (): JSX.Element => {
  const location = useLocation();

  return (
    <TransitionGroup component={ RootContainer }>
      <CSSTransition key={ location.pathname }
                     timeout={ 300 }
                     classNames='fade'>
        <Routes location={ location }>
          { routes }
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
