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


## Change logs

### "version": "0.0.5"
1. Enhancement : As of now Blocs could only create no argument constructor, now blocs can create Argument based constructor.

### "version": "0.0.4"
1. Bug fix: parentElement is returned null often when nesting custom elements. This fixes that issue and uses parent node and host property to get to the actual parent node.

### "version": "0.0.3"
1. Bug fix: use attribute was putting debug logs to console.
2. Bug fix: use attributes value must be trimmed before use.

### "version": "0.0.2"
1. **use** attribute now on BlocsProvider, BlocBuilder and ReposProvider.\
In html:
```html
 <counter-bloc-builder use="color: red;"></counter-bloc-builder>
```
In JS code:
```js
builder(state){
    let color = this.useAttribute["color"];
    return html`
    <div style="color: ${color}">Current state is : ${state}</div>
    <div><button @click=${this.increment}>increment</button></div>
    <div><button @click=${this.decrement}>decrement</button></div>
    `;
}
```