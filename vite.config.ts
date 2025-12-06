import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    base: '/klondike-spec/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true, // Enable PWA in dev mode for testing
            },
            includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'cards/**/*.svg'],
            manifest: {
                name: 'Klondike Solitaire',
                short_name: 'Solitaire',
                description: 'A beautiful, modern Klondike Solitaire game',
                theme_color: '#1a5f2a',
                background_color: '#1a5f2a',
                display: 'standalone',
                orientation: 'any',
                scope: '/klondike-spec/',
                start_url: '/klondike-spec/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'New Game',
                        short_name: 'New',
                        description: 'Start a new game of Klondike Solitaire',
                        url: '/klondike-spec/game?action=new',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
                    },
                    {
                        name: 'Continue Game',
                        short_name: 'Continue',
                        description: 'Resume your last saved game',
                        url: '/klondike-spec/game',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
