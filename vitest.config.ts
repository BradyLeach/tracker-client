/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig( {
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
        exclude: ['node_modules', 'dist', '.next', '.cache'],
    },
    // Inject ENV.ENVIRONMENT for tests
    define: {
        'ENV.ENVIRONMENT': JSON.stringify('test'),
    },
} );