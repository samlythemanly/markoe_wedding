import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Drawer,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { accommodationsRoute } from '@views/accommodations_page';
import { dressCodeRoute } from '@views/dress_code_page';
import { gettingThereRoute } from '@views/getting_there_page';
import { homeRoute } from '@views/home_page';
import { ourStoryRoute } from '@views/our_story_page';
import { registryRoute } from '@views/registry_page';
import { rsvpRoute } from '@views/rsvp_page';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * The static top navigation bar for the entire app.
 */
export function NavBar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const openMenu = React.useCallback(() => {
    setIsMenuOpen(true);
  }, [setIsMenuOpen]);
  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const orderedRoutes = React.useMemo(
    () =>
      [
        homeRoute,
        ourStoryRoute,
        gettingThereRoute,
        accommodationsRoute,
        dressCodeRoute,
        rsvpRoute,
        registryRoute,
      ].map((route) => (
        <Grid item key={route.title}>
          <Link
            component={RouterLink}
            to={route.path}
            onClick={closeMenu}
            underline="none"
            sx={{
              '&:hover': {
                color: 'text.secondary',
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {route.title}
            </Typography>
          </Link>
        </Grid>
      )),
    [],
  );

  return (
    <AppBar position="fixed" color="transparent" elevation={0}>
      <Grid
        justifyContent="space-between"
        container
        display={{ md: 'flex', xs: 'none' }}
        sx={{ padding: '16px 32px' }}
      >
        {orderedRoutes}
      </Grid>
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={openMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" keepMounted open={isMenuOpen} onClose={closeMenu}>
          <Grid
            container
            direction="column"
            spacing={3}
            sx={{ padding: '16px 32px' }}
          >
            {orderedRoutes}
          </Grid>
        </Drawer>
      </Box>
    </AppBar>
  );
}
