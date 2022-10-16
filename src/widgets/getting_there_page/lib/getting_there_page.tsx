import { Route } from '../../../navigation';

import styles from './getting_there_page.module.scss';

export function GettingTherePage(): JSX.Element {
  return (
    <div className={ styles.container }>
      Getting there
    </div>
  );
}

export const gettingThereRoute = new Route('Getting there', GettingTherePage);
