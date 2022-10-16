import { Route } from '../../../navigation';

import styles from './our_story_page.module.scss';

export function OurStoryPage(): JSX.Element {
  return (
    <div className={ styles.container }>
      Our story
    </div>
  );
}

export const ourStoryRoute = new Route('Our story', OurStoryPage);
