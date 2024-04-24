import { builtinModules } from 'node:module';
import { defineConfig, mergeConfig } from 'vite';
import pkg from './package.json';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];
export const external = [...builtins, ...Object.keys(pkg.dependencies || {})];

/** @type {(env: import('vite').ConfigEnv<'build'>) => import('vite').UserConfig} */
export const getBuildConfig = (env) => {
  const { root, mode, command } = env;
  return {
    root,
    mode,
    build: {
      copyPublicDir: command === 'build',
      emptyOutDir: false,
      minify: command === 'build',
      outDir: '.vite',
      watch: command === 'serve' ? {} : null,
    },
    clearScreen: false,
  };
};

/** @type {(command: 'reload' | 'restart') => import('vite').Plugin} */
export const pluginHotRestart = (command) => {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {
          server.ws.send({ type: 'full-reload' });
        }
      } else {
        process.stdin.emit('data', 'rs');
      }
    },
  };
};

export default defineConfig((env) => {
  /** @type {import('vite').ConfigEnv<'build'>} */
  const config = {
    build: {
      lib: {
        entry: ['main.js', 'remote.js'],
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [pluginHotRestart('restart')],
    resolve: {
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  };
  return mergeConfig(getBuildConfig(env), config);
});