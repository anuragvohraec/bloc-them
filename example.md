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
