import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { cp } from 'fs/promises'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.app.json', entryRoot: 'src', insertTypesEntry: true }),
    {
      name: 'copy-assets',
      closeBundle: () => cp('src/assets', 'dist/assets', { recursive: true }),
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `entity-updater.${format}.js`,
    },
    rollupOptions: {
      external: [
        'typescript',
        'prettier',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
    },
  },
})