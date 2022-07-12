import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={`${styles.content} ${commonStyles.pageWidth}`}>
        <div className={commonStyles.contentWidth}>
          <Link href="/">
            <a>
              <img src="Logo.svg" alt="logo" />
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
