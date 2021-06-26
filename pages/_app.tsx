import '../styles/globals.css';
import { AppProps } from 'next/app';
import { ReactElement } from 'react';
/**
 * Default NextJs Boostrap
 */
export default function App({ Component, pageProps }: AppProps): ReactElement {
    return <Component {...pageProps} />;
}
