import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { cp } from 'fs/promises'
import { resolve } from 'path'
import { builtinModules } from 'module'

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.node.json', include: ['src/index.ts'], entryRoot: 'src' }),
    {
      name: 'copy-assets',
      closeBundle: () => cp('src/assets', 'dist/assets', { recursive: true }),
    },
  ],
  build: {
    minify: false,
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