# Version changes
## 9.0.0 
Complete rewrite removed `lit-html` and used its own template system

## 9.0.1
1. Bug Fix: `repeat` function was not removing old items, which are were no more required.
2. Enahancement: run time listening to new blocs from a bloc.
    1. Use `this.listenToBloc.push` to add items
    2. Call `super.onConnection` to create new listener to the bloc
3. `console.error` is printed for bloc throwing error while in build