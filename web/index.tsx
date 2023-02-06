import { Box, CssBaseline, Fade } from '@mui/material';
import { grey } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ServiceProvider } from '@services/common';
import { RsvpService } from '@services/rsvp';
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
import { BrowserRouter, Route } from 'react-router-dom';
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

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: grey[100],
    },
    secondary: {
      main: grey[100],
    },
    background: {
      default: grey[900],
    },
    text: {
      primary: grey[50],
      secondary: grey[400],
    },
  },
  typography: {
    fontFamily: 'Barlow Condensed',
  },
});

const autocompleteService = new google.maps.places.AutocompleteService();
const rsvpService = new RsvpService();

/**
 * The root application widget which acts as a container for all of the site's
 * pages.
 */
const Root = (): JSX.Element => {
  const routeRefs = React.useRef(
    Array(routes.length)
      .fill(null)
      .map(() => React.createRef<HTMLDivElement>()),
  );

  return (
    <ServiceProvider
      autocompleteService={autocompleteService}
      rsvpService={rsvpService}
    >
      <TransitionGroup>
        {routes.map(({ path, Page }, index) => {
          const transitionDuration = 600;

          return (
            <Route key={path} path={path} exact>
              {({ match }) => (
                <Fade
                  in={match?.path === path}
                  timeout={transitionDuration}
                  unmountOnExit
                >
                  <Box
                    alignItems="center"
                    display="flex"
                    flex="1"
                    justifyContent="center"
                    minHeight="100vh"
                    ref={routeRefs.current[index]}
                  >
                    <Page />
                  </Box>
                </Fade>
              )}
            </Route>
          );
        })}
      </TransitionGroup>
    </ServiceProvider>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('root')!);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <NavBar />
          <Root />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
});
