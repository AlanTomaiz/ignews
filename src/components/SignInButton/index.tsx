import { signIn, signOut, useSession } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

export function SignInButton() {
  const { data } = useSession();

  return !!data ? (
    <button
      type="button"
      className={styles.button}
      onClick={() => signOut()}
    >
      <FaGithub color="#04d361" />
      {data.user.name}
      <FiX color="#737380" className={styles.close} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.button}
      onClick={() => signIn('github')}
    >
      <FaGithub color="#eba417" />
      Sign in with Github
    </button>
  )
}