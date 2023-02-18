import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

/**
 * The default theme of the app.
 */
export const theme = createTheme({
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
