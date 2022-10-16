import { Route } from '../../../navigation';

import styles from './dress_code_page.module.scss';

export function DressCodePage(): JSX.Element {
  return (
    <div className={ styles.container }>
      Dress code
    </div>
  );
}

export const dressCodeRoute = new Route('Dress code', DressCodePage);
