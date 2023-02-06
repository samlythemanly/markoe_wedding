import { cleanup, render } from '@testing-library/react';

import { PoweredByGoogle } from '../lib/powered_by_google';

describe(PoweredByGoogle.name, () => {
  afterEach(cleanup);

  test('renders the google logo properly', () => {
    const logo = render(<PoweredByGoogle />);

    expect(logo).toMatchSnapshot();
  });
});
