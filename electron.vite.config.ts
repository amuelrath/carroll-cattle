import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared'),
        '@utility': resolve('src/utility')
      }
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
          worker: resolve('src/utility/index.ts')
        }
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@preload': resolve('src/preload')
      }
    },
    build: {
      sourcemap: true
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: 'src/routes',
        generatedRouteTree: 'src/routeTree.gen.ts'
      }),
      react(),
      tailwindcss()
    ]
  }
})
