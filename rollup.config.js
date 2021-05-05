// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
  input: './index.ts',
  output: {
    dir: 'dist',
    paths:{
        "lit-html": "./lit-html.js"
    },
  },
  plugins: [typescript(),terser()],
  external:["lit-html"],
    
};