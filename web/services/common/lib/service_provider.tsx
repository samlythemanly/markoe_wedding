import { autocompleteServiceContext } from '@services/google_maps';
import { rsvpServiceContext } from '@services/rsvp';
import * as React from 'react';

import type { RsvpService } from '@services/rsvp';

interface ServiceProviderProps extends React.PropsWithChildren {
  autocompleteService: google.maps.places.AutocompleteService;
  rsvpService: RsvpService;
}

/**
 * Convenience wrapper to provide all services to child components.
 */
export const ServiceProvider = (props: ServiceProviderProps): JSX.Element => (
  <rsvpServiceContext.Provider value={props.rsvpService}>
    <autocompleteServiceContext.Provider value={props.autocompleteService}>
      {props.children}
    </autocompleteServiceContext.Provider>
  </rsvpServiceContext.Provider>
);
