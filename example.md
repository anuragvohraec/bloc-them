# using properties to rebuild example
```js
        class TimerBloc extends Bloc{
            constructor(){
                super(0);

                setInterval(()=>{
                    this.emit(this.state+1);
                },1000);
            }
        };
        customElements.define("timer-widget", class extends ListenerWidget{
            constructor(){
                super({
                    blocName:"TimerBloc",
                    hostedBlocs:{
                        TimerBloc: new TimerBloc()
                    }
                });
            }
            build(state){
                return html`<value-displayer .val=${state}></value-displayer>`;
            }
        });
        customElements.define("value-displayer",class extends ListenerWidget{
            set val(newval){
                this.rebuild(newval);
            }

            build(state){
                if(state){
                    return html`<div>${state}</div>`;
                }
            }
        });
```


### Repeat example
```js
import {Bloc, ListenerWidget,html, render ,repeat} from "./index.js";

customElements.define("c-widget",class extends ListenerWidget{
    build(state){
        return html`<div style="color:red">${this.count}</div>`;
    }
});

class CounterWidget extends ListenerWidget{
    _items =[2,3,4];
    get items(){
        return this._items;
    }
    connectedCallback(){
        super.connectedCallback();
        setTimeout(()=>{
            this._items=[2,3,6];
            this.rebuild();
        },3000);
    }
    build(state){
        return html`<div>${repeat(this.items,i=>i,(i,idx)=>{
            return html`<c-widget .count=${i}></c-widget>`;
        })}</div>`;
    }
}
customElements.define("counter-widget",CounterWidget);
```