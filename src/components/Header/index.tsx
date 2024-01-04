import { ActiveLink } from '../ActiveLink';
import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <ActiveLink href="/" routeName="Home" />
          <ActiveLink href="/posts" routeName="Posts" />
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}