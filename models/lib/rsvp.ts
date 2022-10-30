import type { Guest } from './guest';

/**
 * All information regarding a single RSVP.
 */
export interface Rsvp {
  /**
   *  The unique ID of the RSVP.
   *
   *  This corresponds to the Google Maps Place ID of where the address the
   *  physical invitation was mailed.
   */
  id: string;

  /**
   * All of the guests associated with this RSVP.
   */
  guests: Guest[];

  /**
   * The current status of response for the guests.
   *
   * Defaults to pending.
   */
  status: RsvpStatus;

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

/**
 * The confirmation status of an RSVP.
 */
export enum RsvpStatus {
  pending,
  confirmed,
  declined,
}
