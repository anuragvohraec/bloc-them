// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
  input: './index.ts',
  output: {
    dir: 'dist',
    paths:{
    },
  },
  plugins: [typescript(),terser()],
  external:["lit-html"],
    
};