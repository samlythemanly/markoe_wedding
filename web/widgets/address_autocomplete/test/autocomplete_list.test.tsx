import { cleanup, render } from '@testing-library/react';

import { AutocompleteList } from '../lib/src/autocomplete_list';

describe(AutocompleteList.name, () => {
  afterEach(cleanup);

  test('is rendered properly', () => {
    const list = render(
      <AutocompleteList>
        <div>Option 1</div>
        <div>Option 2</div>
        <div>Option 3</div>
      </AutocompleteList>,
    );

    expect(list).toMatchSnapshot();
  });
});
