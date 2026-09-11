// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import license from 'rollup-plugin-license';

const config = {
  input: 'src/main.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true
  },
  external: ['kerberos'],
  plugins: [
    json(),
    typescript(),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    license({
      thirdParty: {
        output: {
          file: 'dist/licenses.txt'
        }
      }
    })
  ]
};

export default config;
