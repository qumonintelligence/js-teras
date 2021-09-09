// @ts-check

import { terser } from 'rollup-plugin-terser';
import typescript2 from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

/**
 * Comment with library information to be appended in the generated bundles.
 */
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author.name}
 * Released under the ${pkg.license} License.
 */
`;

/**
 * Creates an output options object for Rollup.js.
 * @param {import('rollup').OutputOptions} options
 * @returns {import('rollup').OutputOptions}
 */
function createOutputOptions(options) {
  return {
    banner,
    name: pkg.name,
    exports: 'named',
    sourcemap: true,
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'redux': 'redux',
      'redux-saga': 'createSagaMiddleware',
      'react-redux': 'react-redux',
      'redux-saga/effects': 'sagaEffects',
      'qs': 'qs',
      'lodash/map': 'lodash/map',
      'lodash/omit': 'lodash/omit',
      'lodash/pick': 'lodash/pick',
    },
    ...options,
  };
}

/**
 * @type {import('rollup').RollupOptions}
 */
const options = {
  input: './src/index.ts',
  output: [
    createOutputOptions({
      file: './dist/index.js',
      format: 'commonjs',
    }),
    createOutputOptions({
      file: './dist/index.cjs',
      format: 'commonjs',
    }),
    createOutputOptions({
      file: './dist/index.mjs',
      format: 'esm',
    }),
    createOutputOptions({
      file: './dist/index.esm.js',
      format: 'esm',
    }),
    createOutputOptions({
      file: './dist/index.umd.js',
      format: 'umd',
    }),
    createOutputOptions({
      file: './dist/index.umd.min.js',
      format: 'umd',
      plugins: [terser()],
    }),
  ],
  external: [
    'react-redux',
    'redux-saga',
    'react',
    'qs',
    'lodash/omit',
    'lodash/pick',
    'lodash/map',
  ],
  plugins: [
    terser(),
    typescript2({
      clean: true,
      useTsconfigDeclarationDir: true,
      tsconfig: './tsconfig.bundle.json',
    }),
    nodeResolve({ preferBuiltins: false, modulesOnly: true }), // or `true`
    commonjs({
      include: 'node_modules/**',
    }),
    replace({
      'preventAssignment': true,
      'process.browser': true,
    }),
  ],
};

export default options;
