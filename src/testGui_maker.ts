import { html } from "lit-html";
import { Bloc } from "./bloc/bloc";
import { BlocsProvider } from "./bloc/blocs-provider";
import { GuiMaker } from "./bloc/gui-maker";


export class AnotherCounterBloc extends Bloc<number>{
    _name="AnotherCounterBloc";
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

GuiMaker.define({
    bloc_name: "AnotherCounterBloc",
    builder_function:(state:number)=>{
        return html`<div>Count is : ${state}</div>
        <slot></slot>
        `;
    },
    tag_name:"blocs-gui-maker",
    tag_prefix:"test",
    blocs_map:{
        AnotherCounterBloc: new AnotherCounterBloc()
    }
})

GuiMaker.define({
    bloc_name: "AnotherCounterBloc",
    builder_function:(state:number)=>{
        return html`<button @click=${function(e:Event){
            let ctx:HTMLElement = e.currentTarget as HTMLElement;
            BlocsProvider.search<AnotherCounterBloc>("AnotherCounterBloc",ctx)?.increment();
        }}>Click me</button>`;
    },
    tag_name:"blocs-gui-maker-actuator",
    tag_prefix:"test",
})