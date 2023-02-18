import { RsvpStatus } from '@models';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Guest, Rsvp } from '@models';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

import { RsvpSummary, RsvpSummaryTestId } from '../lib/src/rsvp_summary';

describe(RsvpSummary.name, () => {
  let user: UserEvent;
  let hasBeenClicked: boolean;
  function click(): void {
    hasBeenClicked = true;
  }

  beforeEach(() => {
    user = userEvent.setup();

    hasBeenClicked = false;
  });

  function renderSummary(rsvp: Rsvp): void {
    render(<RsvpSummary rsvp={rsvp} onClick={click} />);
  }

  function createGuest(name: string): Guest {
    return {
      name,
      status: RsvpStatus.confirmed,
      isPlusOne: false,
    };
  }

  function createRsvp(guests: string[]): Rsvp {
    return {
      guests: guests.map(createGuest),
      id: `${guests[0]} id`,
      email: `${guests[0]}@example.com`,
      canHavePlusOne: true,
    };
  }

  afterEach(cleanup);

  test('renders an RSVP with a single guest properly', () => {
    const rsvp: Rsvp = createRsvp(['Milo']);
    renderSummary(rsvp);

    const summary = screen.getByTestId(RsvpSummaryTestId.root);
    expect(summary.textContent).toEqual('Milo');
  });

  test('renders an RSVP with two guests properly', () => {
    const rsvp: Rsvp = createRsvp(['Milo', 'Huck']);
    renderSummary(rsvp);

    const summary = screen.getByTestId(RsvpSummaryTestId.root);
    expect(summary.textContent).toEqual('Milo and Huck');
  });

  test('renders an RSVP with more than two guests properly', () => {
    const rsvp: Rsvp = createRsvp(['Milo', 'Huck', 'Ollie']);
    renderSummary(rsvp);

    const summary = screen.getByTestId(RsvpSummaryTestId.root);
    expect(summary.textContent).toEqual('Milo, Huck, and Ollie');
  });

  test('calls onClick when clicked', async () => {
    const rsvp: Rsvp = createRsvp(['Milo']);
    renderSummary(rsvp);

    const summary = screen.getByTestId(RsvpSummaryTestId.root);
    await user.click(summary);

    expect(hasBeenClicked).toEqual(true);
  });
});
