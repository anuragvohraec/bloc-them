# \<bloc-them>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation
```bash
npm i bloc-them
```

## Usage
For a detail usage see the demo directory in the git.

```ts
import {Bloc, BlocsProvider, BlocBuilder} from 'lit-bloc-js';
import {html, TemplateResult} from 'lit-html';

export class CounterBloc extends Bloc<number>{

  constructor(){
      super(0);
  }

  increment(){
      let n = this.state;
      n++;
      this.emit(n);
  }

  decrement(){
      let n = this.state;
      n--;
      this.emit(n);
  }
}

export class CounterBlocProvider extends BlocsProvider{
  constructor(){
      super([new CounterBloc()]);
  }

  builder(){
      return html`<div><slot></slot></div>`;
  }
}


export class CounterBlocBuilder extends BlocBuilder<CounterBloc, number>{
  constructor(){
      super(CounterBloc);
  }

  increment=()=>{
    this.bloc?.increment();
  }

  decrement=()=>{
    this.bloc?.decrement();
  }

  builder(state: number): TemplateResult{
    console.log("building");
    
      return html`
      <div>Current state is : ${state}</div>
      <div><button @click=${this.increment}>increment</button></div>
      <div><button @click=${this.decrement}>decrement</button></div>
      `;
  }
}
```
```html
<script type="module">
   import { html, TemplateResult, render } from 'lit-html';
    import * from '../dist/index.js';
</script>

<counter-bloc-provider>
    <div>
      <h1>Blocs demo</h1>
      <counter-bloc-builder></counter-bloc-builder>
    </div>
  </counter-bloc-provider>
```



## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`
