# [<img src="./des/logo.svg" width="30"/>](image.png) Bloc-Them 
The simplest, but mighty reactive UI framework, any JS developer can learn in less than 15 minutes!

# Tutorial
The core theme of this framework is "Separation of concerns". 
Its provides JS classes to separately encapsulate Business logic and UI code.

Lets start with the code:
```html
<!--Custom web component we created in below our script!-->
<counter-widget></counter-widget>
<script type="module">
    import {Bloc, ListenerWidget,html, render } from "./index.js";

    class CounterBloc extends Bloc{
        constructor(){
            super(0);
        }
        increment(){
            this.emit(this.state+1);
        }
        decrement(){
            this.emit(this.state-1);
        }
    }

    class CounterWidget extends ListenerWidget{
        constructor(){
            super({
                blocName:"CounterBloc",
                hostedBlocs:{
                    CounterBloc: new CounterBloc()
                }
            });
        }

        build(state){
            return html`
                <div>
                    <div>
                        <button @click=${()=>this.bloc().increment()}>increment</button>
                        <button @click=${()=>this.bloc().decrement()}>decrement</button>
                    </div>
                    <div>Result: ${state}</div>
                </div>`;
        }
    }
    //custom web component defined here
    customElements.define("counter-widget",CounterWidget);
</script>
```

### What the above code does:
Business Logic is encapsulated in `Bloc` class (Business Logic Components) and the UI code logic in `ListenerWidget`.
1. `CounterBloc` contains all your business logic (manges state of count).
2. `CounterWidget` contains all the UI code.

After configuring, the `ListenerWidget`, it starts listening for changes in state from its subscribed `Bloc`.
As soon as a bloc `emit` a new state, the listener widget will reactively update itself with new values.

**CounterBloc**
```js
/**
 * Business logic must be encapsulated in Bloc class
*/
 class CounterBloc extends Bloc{
    constructor(){
        //initial state of the Bloc
        super(0);
    }
    increment(){
        //emit function 
        //provided in Bloc class 
        //to emit new state
        this.emit(this.state+1);
    }
    decrement(){
        //emit new state
        this.emit(this.state-1);
    }
}
```

**CounterWidget**
```JS
/**
 * ListenerWidget listens for state changes from blocs
 * In this case we have provided the blocName as `CounterBloc`
 */
class CounterWidget extends ListenerWidget{
        constructor(){
            super({
                blocName:"CounterBloc",//listen to this bloc
                hostedBlocs:{ //Listener UI can host different blocs for other nested UIs
                    CounterBloc: new CounterBloc()
                }
            });
        }

        build(state){
            //`html` is tagged template literal which helps in converting the code into HTML dom Nodes
            //@click is used to attach event listener to a particular node.
            //${state} can be used to get values 
            return html`
                <div>
                    <div>
                        <button @click=${()=>this.bloc().increment()}>increment</button>
                        <button @click=${()=>this.bloc().decrement()}>decrement</button>
                    </div>
                    <div>Result: ${state}</div>
                </div>`;
        }
    }
```


### whats that `html` 
`html` is a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).
Its actually plain old Javascript!, and not `JSX`. It helps in converting template strings into DOM Node.

### No JSX , do it means it re-render entire nodes.
It do not uses virtual dom, but still it only modify those portion of UI nodes, which have been updated!!!
Its comparable to virtual DOM, though using plain old vanilla javascript.

## More about what can go inside `html`
You can add any valid HTML code inside `html` tagged template string.
You can add event listeners using `@` prefix: For example `@touchmove` to listen to `touchmove` event.
You can add custom properties to a component using `.`: For example `<my-app .config=${runtimeConfig}>`, and whenever the `runtimeConfig` changes , it will automatically change the properties on `my-app`.
You can also add attributes as such `<div style=${"color:white;display:"+{true?"block":"none"}}>`
Also can add and aut remove optional attributes using `?`: For example `<div ?optional_att=${ifTrueThenShow}>`.


**And thats it!!!**

__________
# THE END

See how this has been used to create complex UI web component library : [use-them](https://www.npmjs.com/package/use-them)