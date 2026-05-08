import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { cp } from 'fs/promises'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], insertTypesEntry: true }),
    {
      name: 'copy-assets',
      closeBundle: () => cp('src/assets', 'dist/assets', { recursive: true }),
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EntityUpdater',
      formats: ['es', 'cjs'],
      fileName: (format) => `entity-updater.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', ...builtinModules, ...builtinModules.map(m => `node:${m}`)],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})