import { useEffect } from 'react';
import posthog from 'posthog-js';
import '../styles/globals.css'
import '../styles/main.css';
import type { AppProps } from 'next/app'
import { siteConfig } from '@/config/site';
import WhatsAppLeadFormLoader from '@/src/components/lead/WhatsAppLeadFormLoader';

declare global {
    interface Window {
        posthog?: typeof posthog;
    }
}

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
        const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

        if (!projectToken || posthog.__loaded) {
            return;
        }

        posthog.init(projectToken, {
            api_host: apiHost,
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: false,
            disable_session_recording: true,
            person_profiles: 'identified_only',
            loaded: () => {
                console.info(`[${siteConfig.name} tracking] PostHog initialized`);
            },
        });
        window.posthog = posthog;
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <WhatsAppLeadFormLoader />
        </>
    )
}
