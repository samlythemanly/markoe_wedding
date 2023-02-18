import { rsvpRoute } from '@views/rsvp_page/lib/rsvp_page';

import type { Rsvp } from '@models';
import type {
  ExpectationResult,
  MatcherContext,
  MatcherFunction,
} from 'expect';

function matchRsvpPageRoute(
  this: MatcherContext,
  mockNavigate: unknown,
  rsvps: Rsvp[],
): ExpectationResult {
  if (!jest.isMockFunction(mockNavigate)) {
    return {
      message: () =>
        'expected a mock navigate function but received ' +
        `${this.utils.printReceived(mockNavigate)}`,
      pass: false,
    };
  }

  try {
    expect(mockNavigate).toHaveBeenCalledWith(
      rsvpRoute.path,
      expect.objectContaining({ state: { rsvps } }),
    );

    return {
      message: () =>
        `expected ${this.utils.printReceived(
          mockNavigate,
        )} to NOT have navigated to the RSVP page with with ` +
        `${this.utils.printExpected(`${JSON.stringify(rsvps)}`)}`,
      pass: true,
    };
  } catch {
    return {
      message: () =>
        `expected ${this.utils.printReceived(
          mockNavigate,
        )} to have navigated to the RSVP page with with ` +
        `${this.utils.printExpected(`${JSON.stringify(rsvps)}`)}`,
      pass: false,
    };
  }
}

const toHaveNavigatedToRsvpPageWith: MatcherFunction<[rsvps: Rsvp[]]> =
  matchRsvpPageRoute;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    export interface Matchers<R> {
      toHaveNavigatedToRsvpPageWith: (rsvps: Rsvp[]) => R;
    }
  }
}

/**
 * Extends jest with custom matchers for the RSVP page and its route.
 *
 * This could be done in jest setup, but that obfuscates where things are
 * defined and makes it harder to determine which files depend on what. This
 * makes it explicit.
 */
export function setUpRsvpPageJest(): void {
  expect.extend({
    toHaveNavigatedToRsvpPageWith,
  });
}
