import { cleanup, render } from '@testing-library/react';

import { RsvpPage } from '..';

describe(RsvpPage.name, () => {
  afterEach(cleanup);

  test('renders properly', () => {
    const page = render(<RsvpPage />);

    expect(page).toMatchSnapshot();
  });
});
