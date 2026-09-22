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
        let cancelled = false;

        async function initializePostHog() {
            let projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
            let apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

            if (!projectToken) {
                try {
                    const response = await fetch('/api/posthog-config');
                    if (!response.ok) return;

                    const config = await response.json() as {
                        projectToken?: string;
                        host?: string;
                    };
                    projectToken = config.projectToken;
                    apiHost = config.host || apiHost;
                } catch {
                    return;
                }
            }

            if (cancelled || !projectToken) return;

            if (!posthog.__loaded) {
                posthog.init(projectToken, {
                    api_host: apiHost,
                    capture_pageview: false,
                    capture_pageleave: true,
                    autocapture: false,
                    disable_session_recording: true,
                    capture_exceptions: true,
                    person_profiles: 'identified_only',
                    loaded: () => {
                        console.info(`[${siteConfig.name} tracking] PostHog initialized`);
                    },
                });
            }

            window.posthog = posthog;
        }

        void initializePostHog();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <WhatsAppLeadFormLoader />
        </>
    )
}
