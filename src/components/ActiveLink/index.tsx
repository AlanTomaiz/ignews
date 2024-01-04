import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';

interface ActiveLinkProps extends LinkProps {
  routeName: string;
}

export function ActiveLink({ routeName, ...rest }: ActiveLinkProps) {
  const { asPath } = useRouter();

  const isActiveRoute = asPath === rest.href;

  return (
    <Link {...rest} data-active={isActiveRoute}>
      <span>{routeName}</span>
    </Link>
  )
}