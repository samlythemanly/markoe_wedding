import { RsvpStatus } from '@models';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setUpRsvpPageJest } from '@views/rsvp_page/testing';
import { RsvpSelector } from '@widgets/rsvp_selector';

import type { Guest, Rsvp } from '@models';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

import { RsvpSummaryTestId } from '../lib/src/rsvp_summary';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe(RsvpSelector.name, () => {
  let user: UserEvent;

  beforeAll(() => {
    setUpRsvpPageJest();
  });

  beforeEach(() => {
    user = userEvent.setup();
  });

  function renderSelector(rsvps: Rsvp[]): void {
    render(<RsvpSelector rsvps={rsvps} />);
  }

  function createGuest(name: string): Guest {
    return {
      name,
      status: RsvpStatus.confirmed,
      isPlusOne: false,
    };
  }

  function createRsvp(guestName: string): Rsvp {
    return {
      guests: [createGuest(guestName)],
      id: `${guestName} id`,
      email: `${guestName}@example.com`,
      canHavePlusOne: true,
    };
  }

  afterEach(cleanup);

  test('renders an RSVP summary for each RSVP', () => {
    const rsvps: Rsvp[] = [createRsvp('Milo'), createRsvp('Huck')];
    renderSelector(rsvps);

    const summaries = screen.queryAllByTestId(RsvpSummaryTestId.root);
    expect(summaries).toHaveLength(2);
  });

  test('navigates to the RSVP page with the selected RSVP on summary click', async () => {
    const rsvp: Rsvp = createRsvp('Milo');
    renderSelector([rsvp]);

    const summary = screen.getByTestId(RsvpSummaryTestId.root);
    await user.click(summary);

    expect(mockNavigate).toHaveNavigatedToRsvpPageWith([rsvp]);
  });
});
