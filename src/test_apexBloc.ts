import { html } from "lit-html";
import { ApexBloc } from "./bloc/gui-maker"

export class CounterApexBloc extends ApexBloc{
    private count=0;

    constructor(){
        super(html`<span style="user-select: none;">click me I am Apex</span>`)
    }

    increment=(e:Event)=>{
        this.count++;
        this.emit(html`<div style="user-select: none;">Count is: ${this.count}</div>`);
    }

    notifyAttributeChange<T>(newValue: T): void {
        throw new Error("Method not implemented.");
    }
    protected _name: string="CounterApexBloc";
}
