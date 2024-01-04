import { SessionProvider as NextAuthProvider } from 'next-auth/react';
import { AppProps } from "next/app";

import { Header } from "../components/Header";
import '../styles/global.sass';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  )
}