import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig( ( { mode } ) =>
{
    // Load env for vite.config.ts-specific settings (port, HMR host)
    // App code reads import.meta.env directly via src/config/env.ts
    const env = loadEnv( mode, process.cwd(), '' );

    const port = env.VITE_PORT ? parseInt( env.VITE_PORT, 10 ) : 5175;

    return {
        plugins: [react(), tsconfigPaths(), svgr()],
        server: {
            host: '0.0.0.0', // Essential for Docker
            port,
            watch: {
                usePolling: true, // Critical for Docker file watching
                interval: 3000,
            },
            hmr: {
                // HMR connects through nginx which proxies to Vite
                ...(env.VITE_HMR_HOST && { host: env.VITE_HMR_HOST }),
                clientPort: env.VITE_HMR_PORT ? parseInt( env.VITE_HMR_PORT, 10 ) : 446,
            }
        },
        preview: {
            host: '0.0.0.0',
            port: 4175,
        },
        // Manual chunk splitting for better caching
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        // React core - rarely changes
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        // MUI core - theme and base components
                        'mui-core': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
                        // MUI extras - date pickers, lab components
                        'mui-extras': ['@mui/x-date-pickers', '@mui/lab'],
                        // Forms - validation and form handling
                        'forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
                        // i18n - internationalization
                        'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                        // Utilities - commonly used across app
                        'utils': ['axios', 'dayjs', 'react-helmet-async'],
                        // Rich text - editor and its ProseMirror core
                        'richtext': [
                            '@tiptap/react',
                            '@tiptap/core',
                            '@tiptap/starter-kit',
                            '@tiptap/extensions',
                            '@tiptap/static-renderer',
                        ],
                    }
                }
            }
        }
    };
} );
