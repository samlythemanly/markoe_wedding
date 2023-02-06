import { Route } from '@common/navigation';
import { Box, Button, Grid, Link, Typography } from '@mui/material';
import { registryRoute } from '@views/registry_page';
import { rsvpRoute } from '@views/rsvp_page';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Displays general information for the wedding (along with a cute picture).
 */
export function HomePage(): JSX.Element {
  const groomsName = 'Sam';
  const bridesName = 'Stephanie';
  const date = 'June 3rd, 2023 5:00PM';
  const location = 'Malibou Lake Lodge, Agoura Hills, CA';
  const publicUrl = process.env.PUBLIC_URL;
  const backgroundImageUrl = `url(${`${publicUrl}/home_background.jpg`})`;

  const buttonLink = React.useCallback(
    (route: Route) => (
      <Link
        component={RouterLink}
        to={route.path}
        underline="none"
        color="text.primary"
        border="1px solid"
        borderColor="text.primary"
        borderRadius={2}
        sx={{
          '&:hover': {
            color: 'text.secondary',
          },
        }}
      >
        <Button size="large">
          <Typography variant="h6" fontWeight="bold">
            {route.title}
          </Typography>
        </Button>
      </Link>
    ),
    [],
  );

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minHeight="100vh"
    >
      <Grid
        alignItems="center"
        container
        direction="column"
        item
        justifyContent="center"
        textTransform="uppercase"
        typography="h1"
      >
        {groomsName}
        <Typography variant="h1" fontFamily="Qwitcher Grypen">
          &
        </Typography>
        {bridesName}
      </Grid>
      <Grid
        alignItems="center"
        container
        direction="column"
        fontWeight="bold"
        justifyContent="center"
        spacing={2}
        typography="h5"
      >
        <Grid item>{date}</Grid>
        <Grid item>{location}</Grid>
        <Grid
          alignItems="center"
          container
          direction="row"
          item
          justifyContent="center"
          spacing={2}
        >
          <Grid display="flex" item>
            {buttonLink(rsvpRoute)}
          </Grid>
          <Grid display="flex" item>
            {buttonLink(registryRoute)}
          </Grid>
        </Grid>
      </Grid>
      <Box
        height="100%"
        position="absolute"
        width="100%"
        zIndex="-1"
        sx={{
          backgroundImage: backgroundImageUrl,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center left',
          backgroundSize: 'cover',
          opacity: 0.5,
        }}
      />
    </Box>
  );
}

export const homeRoute = new Route('Home', HomePage, '/');
