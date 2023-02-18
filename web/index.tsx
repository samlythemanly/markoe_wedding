import { Box, CssBaseline, Fade } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ServiceProvider } from '@services/common';
import { RsvpService } from '@services/rsvp';
import { theme } from '@theme';
import { accommodationsRoute } from '@views/accommodations_page';
import { dressCodeRoute } from '@views/dress_code_page';
import { gettingThereRoute } from '@views/getting_there_page';
import { homeRoute } from '@views/home_page';
import { NavBar } from '@views/nav_bar';
import { ourStoryRoute } from '@views/our_story_page';
import { registryRoute } from '@views/registry_page';
import { rsvpRoute } from '@views/rsvp_page';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

const routes = [
  accommodationsRoute,
  dressCodeRoute,
  gettingThereRoute,
  homeRoute,
  ourStoryRoute,
  registryRoute,
  rsvpRoute,
];

const routeComponents = routes.map(({ path, Page }) => (
  <Route key={path} path={path} element={<Page />} />
));

/**
 * The root application widget which acts as a container for all of the site's
 * pages.
 */
const Root = (): JSX.Element => {
  const location = useLocation();
  const transitionDuration = 600;

  return (
    <TransitionGroup component={null}>
      <Fade key={location.key} timeout={transitionDuration}>
        <Box
          alignItems="center"
          display="flex"
          flex="1"
          justifyContent="center"
          minHeight="100vh"
        >
          <Routes location={location}>{routeComponents}</Routes>
        </Box>
      </Fade>
    </TransitionGroup>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('root')!);
  const autocompleteService = new google.maps.places.AutocompleteService();
  const rsvpService = new RsvpService();

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ServiceProvider
            autocompleteService={autocompleteService}
            rsvpService={rsvpService}
          >
            <CssBaseline enableColorScheme />
            <NavBar />
            <Root />
          </ServiceProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
});
