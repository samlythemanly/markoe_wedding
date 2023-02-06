/* eslint-disable react/jsx-props-no-spreading */
import { Container } from '@mui/material';
import React from 'react';

import { PoweredByGoogle } from './powered_by_google';

/**
 * Options list which also displays the Powered by Google logo for
 * autocompletion results.
 */
export const AutocompleteList = React.forwardRef(function List(
  listProps: React.HTMLAttributes<HTMLElement>,
  ref: React.Ref<HTMLUListElement>,
) {
  return (
    <Container>
      <ul {...listProps} ref={ref} />
      <PoweredByGoogle />
    </Container>
  );
});
