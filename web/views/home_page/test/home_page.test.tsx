import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { HomePage } from '..';

describe(HomePage.name, () => {
  afterEach(cleanup);

  test('renders properly', () => {
    const page = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(page).toMatchSnapshot();
  });
});
