import type { Guest } from './guest';

/**
 * All information regarding a single RSVP.
 */
export interface Rsvp {
  /**
   *  The unique ID of the RSVP.
   */
  id: string;

  /**
   * All of the guests associated with this RSVP.
   */
  guests: Guest[];

  /**
   * The primary email for the guests associated with this RSVP.
   */
  email: string;

  /**
   * Whether the guest(s) may bring a plus-one.
   *
   * Defaults to false.
   */
  canHavePlusOne: boolean;

  /**
   * A song suggestion which we can play at the wedding!
   */
  songRecommendation?: string;
}
