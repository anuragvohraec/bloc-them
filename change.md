# Version changes
## 9.0.0 
Complete rewrite removed `lit-html` and used its own template system

## 9.0.1
1. Bug Fix: `repeat` function was not removing old items, which are were no more required.
2. Enahancement: run time listening to new blocs from a bloc.
    1. Use `this.listenToBloc.push` to add items
    2. Call `super.onConnection` to create new listener to the bloc
3. `console.error` is printed for bloc throwing error while in build

## 9.0.2
1. Dot properties where not called properly and setter were not called.
2. Added new method `bindInputToState` to **ListenerWidget**, to assist in some basic form validation. Using this an input can be binded to properties on a bloc state.