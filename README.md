# Bloc-Them
A Business Logic Component implementation for front end Javascript web components.\
![LOGO](./des/logo.svg)

If you have not heard what is Bloc design pattern, then check out the [theory](#theory).\
If you are familiar with Bloc, then read descriptions of the components this library offers to use Bloc Pattern for your front end development.

## Pre-requisite for usage
1. Basic understanding of ES6 classes and inheritance.
3. Basic knowledge of [lit-html](https://lit-html.polymer-project.org/).

## Important Classes and uses
### Bloc
Bloc: Business Logic component 
This class will hold and manage state of your application.
In below code `CounterBloc` is managing count state of the bloc. `this.emit` function is used to publish new state of the app.
here increment and decrement function modify the state of the app and publish this new state to UI by `this.emit`
```js
class CounterBloc extends Bloc{
    constructor(){
        //passing init state
        super(0);
    }

    increment=()=>{
        const newState = this.state+1;
        this.emit(newState);
    }

    decrement=()=>{
        const newState = this.state-1;
        this.emit(newState);
    }
}
```

### BlocBuilder
this will create an HTML [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), its uses `lit-html` templating library for creating html templates.
```js
class CounterAppWidget extends BlocBuilder{
    constructor(){
        //passing name of the bloc to subscribe
        super("CounterBloc",{
            //blocs map attaches a bloc at a node in DOM tree.
            blocs_map:{
                //adding counter bloc here so all element down this node in DOM will listen to this bloc
                //any change in state of this bloc will update UI for each of such Widget which subscribed to CounterBloc
                CounterBloc: new CounterBloc()
            }
        });
    }

    builder(state){
        return html`
        ${this.styleThis()}
        <div class="cont">
            <div class="text">${state}</div>
            <div class="button inc" @click=${this.bloc.increment}>Increment</div>
            <div class="button dec" @click=${this.bloc.decrement}>Decrement</div>
        </div>`;
    }

    styleThis(){
        return html`<style>
            .cont{
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
            }
            .text{
                padding: 10px;
                font-size: 2em;
            }
            .button{
                width: 100px;
                text-align: center;
                color: white;
                padding: 10px;
                font-size: 1.2em;
                margin: 10px;
                user-select: none;
            }

            .inc{
                background-color: #77d782;
            }
            .dec{
                background-color: #ff4a4a;
            }
        </style>`;
    }
}
customElements.define("my-app",CounterAppWidget);
```
### BlocsProvider
If you don't want state management in a Widget, but do want it to act as `Bloc` provider to its children than use this one.
see source code for usage

### MultiBlocsReactiveWidget
An HTMLElement webcomponent which can listen to states from various bloc simultaneously and react to state changes from each one of them.
See source code for usage.

**use-them** is set of webcomponents created on top of bloc-them library. They are ready to use webcomponents for creating mobile apps.

# What it can do ?
1. **[use-them](https://www.npmjs.com/package/use-them)** ready to use webcomponent for creating PWA mobile apps.
2. **[lay-them](https://www.npmjs.com/package/lay-them)** to layout your other webcomponents in column, row and stack.
3. **[route-them](https://www.npmjs.com/package/route-them)** to create routes in your single page application.


## Installation
```bash
npm i bloc-them
```

## Usage
For a detail usage see the demo directory in the git.


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`


## Change logs
### "version": "6.0.0"
1. Deprecated concept of Repository and RepoProvider. Use Blocs provider instead. Repo Provider had no significance, and has been marked as deprecated long back
2. Bloc now can subscribe to other blocs , by passing listenToBlocs array. Whenever state of this parent bloc changes they will call reactToStateChangeFrom(blocName,newState) on this bloc
3. Bloc.onConnection gets called right after the host HTMLElement has connected to the DOM tree.
4. Overall many minute changes.

### "version": "5.0.12"
1. Added `bt-apex`. Usage examples:
```html
<!--This one will look for counter bloc in dom tree-->
<bt-apex bloc="CounterApexBloc" @click=${function(){this.bloc.increment()}}></bt-apex>

<!--This one can create on fly blocs and use them-->
<bt-apex bloc="CounterApexBloc" .blocBuilderConfig=${{blocs_map:{CounterApexBloc:new CounterApexBloc()}}} @click=${function(){this.bloc.increment()}}></bt-apex>
```

### "version": "5.0.10"
1. Bug fixes: MultiBlocsReactiveWidget. while searching for blocs it was not taking it in consideration.

### "version": "5.0.9"
1. Bug fixes: BlocBuilder was triggering incorrect onDisconnection calls

### "version": "5.0.8"
1. Bug fixes: BlocBuilder was triggering incorrect onConnection calls

### "version": "5.0.5"
1. Added MultiBlocsReactiveWidget: which can listen to multiple blocs and react to there state change reactively.

### "version": "5.0.4"
1. Added Bloc.search static method to search for blocs.
2. Added search method in repo too.
3. Marked `of` method for bloc search as deprecated.

### "version": "5.0.3"
1. Added GUI maker
2. BlocBuilder now has a BlocsMap , so extra blocs can be provided by it too.
3. BlocsProvider has a default constructor value for the blocs map.

### "version": "5.0.2"
1. Updated readme . 
2. Added Logo.

### "version": "5.0.1"
1. Added rollup support. Now the bloc-them lib can be used as a separate JS file too. YOu need to provide external `lit-html` in that case.

### "version": "5.0.0"
1. Instead of passing array in BlocsProvider and ReposProvider, we now supply blocsMap and repoMaps , basically javascript object. Keys for this maps are name of the Bloc/Repo and value will be the instance of Blocs. The benefit of this is faster Bloc search.
2. Blocs now has hostElement attribute, which can be a BlocsProvider or BlocBuilder. This value is set in connection call and hence is not available during constructor phase. This was added as previously we need to supply a html element to find the blocs, now using this we have automated blocs and repos detection.
3. getRepo and getBloc methods have been added to bloc to find and search for blocs.
4. Bloc constructor has now an optional argument BlocDependencies , via which we can mention Blocs and Repos this bloc wil need to function and those repo and blocs will be made available to the bloc. (and can be get with getRepo and getBloc respectively)
```ts
interface BlocDependencies{
  blocs?:string[];
  repos?:string[];
}
```

### "version": "4.0.0"
1. Have to change bloc searching and naming, as typescript/bundling tools were renaming classes to different names and as such blocs were not visible in all cases.
Now when you extends a bloc you need to provide a protected property _name . This same name is used to search for the bloc in the dom tree.

### "version": "3.0.4"
1. Added more debugging features to bloc builder.

### "version": "3.0.3"
1. Now in widget builder config we can pass custom search criteria to select blocs. This custom 

### "version": "3.0.2"
1. Changed the generic structure for blocs, to make them more generic.

### "version": "3.0.0"
1. Version 2.0.0 is failed concept and often causes infinite loop. Discarding the changes back.

### "version": "2.0.0" : FAILED, DO NOT USE IT
1. Added a prebuid step, to perform async business logic before final render. While this final render is dne, a prerender can be displayed, to show loading.

### "version": "1.0.0"
1. Changed the generic structure for blocs, to make them more generic.

### "version": "0.0.5"
1. Enhancement : As of now Blocs could only create no argument constructor, now blocs can create Argument based constructor.

### "version": "0.0.4"
1. Bug fix: parentElement is returned null often when nesting custom elements. This fixes that issue and uses parent node and host property to get to the actual parent node.

### "version": "0.0.3"
1. Bug fix: use attribute was putting debug logs to console.
3. Bug fix: use attributes value must be trimmed before use.

### "version": "0.0.3"
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



## Theory

### What is Business Logic ?
Lets explain it with examples: 

1. Say you are designing an Arithmetic calculator App. 
Then all logics(**non gui codes** which perform the actual intent of your app) that you will write specifically for your calculator, say **calculate_square_root**, or any other non-gui function(one which do not render's GUI to screen), is termed as Business Logic.
3. Say you are writing a Social media app.
then all logics(**non gui codes** which perform the actual intent of your app) that you will write specifically for your social media pp, say **fetch_user_profile**, **add_new_user_to_indexedb**,or any other non-gui function(one which do not render's GUI to screen), is termed as Business Logic.

Business logic is the basic functionality of your app, which you are trying to offer to client apart from pretty GUI.

### The core aim of business logic ?
The core aim of any business logic is to modulate/maintain/control a state of your application. 
For example,all non gui code for user sign up form, is trying to maintain an object which has all form information user has entered in the form or required to submit the sign up form.

So **the core aim business logic is to modulate state of your app.**
Whenever it modulates this state, the front end GUI, which depends on this state must re-render to give the latest update to user.


For example user types in something in the search box for an app.
The Search box will try to validate it.
Then tries to make a request to resource, which will give the result and once received response from the sources system, may need to modify it to display appropriately on front end GUI.

### What are the problem with existing JS system ?
If you are using vanilla JS to design a big sized app, then there is 99.99% probability, that the one who will maintain your apps for bugs,  will pull their hairs to keep track of places where in you as a developer have written the business logic, which controls state of the application. 

Without a framework, the business logic is spread every where, which experience says is very difficult to track, which ultimate will make a challenge to determine, why the current state of your app is something out of expectation, and further which portion of your code is responsible for that modification.

## How Bloc pattern solves the above problem ?
Bloc : Business Logic Components.
Bloc is framework to keep all your business logic at one place, meanwhile making a predictable state change, so you can track exactly which portion of code has made the change in the state.

A single bloc maintains a single type of state.\
For example:
1. For a counter portion of your app, CounterBloc will only manage current count (state) of the app.
3. For list of options, will maintain current selection and all options as state.

And your GUI uses this state to render out put data. So if the data is incorrect, you exactly know that the Bloc which manages this portion of state of your app, is responsible for this inconsistent behavior.


## Build instruction
1. Roll up `npx rollup -c rollup.config.js`
2. Directly import it into project, for example `import {Bloc} from "/bloc-them/index.js`
