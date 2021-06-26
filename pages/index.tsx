import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const ReactAdmin = dynamic(() => import('../components/ReactAdmin'), {
    ssr: false
});
/**
 * This is a single page app, served by NextJs
 *
 * Rely on <ReactAdmin/> to list services
 */
export default function Home(): ReactNode {
    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <ReactAdmin />
            </main>

            <footer>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by <img src="/vercel.svg" alt="Vercel Logo" />
                </a>
            </footer>
        </div>
    );
}
