import { render, screen } from '@testing-library/react';
import React from 'react';

import { HomePage } from '..';

test('renders learn react link', () => {
  render(<HomePage />);
  const linkElement = screen.getByText(/learn react/u);
  expect(linkElement).toBeInTheDocument();
});
