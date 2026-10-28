import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Tests del motor de clases (corrección, constructores del contenido) sin servidor ni base de datos
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'tests/stubs/empty.ts'),
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
})
