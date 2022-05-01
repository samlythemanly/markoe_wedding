import { Route } from '../../../common/navigation';

import styles from './registry_page.module.scss';

export function RegistryPage(): JSX.Element {
  return (
    <div className={ styles.container }>
      Registry
    </div>
  );
}

export const registryRoute = new Route('Registry', RegistryPage);
