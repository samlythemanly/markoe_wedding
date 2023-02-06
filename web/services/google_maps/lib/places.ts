import * as React from 'react';

export const autocompleteServiceContext = React.createContext<
  google.maps.places.AutocompleteService | undefined
>(undefined);
