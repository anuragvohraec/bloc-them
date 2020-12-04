import { Bloc } from "./bloc";
import { render, TemplateResult } from "lit-html";
import { BlocBuilder } from "./bloc-builder";
import {BaseBlocsHTMLElement} from '../base';

export  interface BlocType< B extends Bloc<S>,S>{
    new(...args: any[]): B
}

export interface OtherBlocSearchCriteria{
    (currentEl: HTMLElement): boolean;
}

export abstract class BlocsProvider extends BaseBlocsHTMLElement{
    constructor(private blocs:Bloc<any>[]){
        super();
    }

    connectedCallback(){
        this._build();
    }

    _findBloc<B extends Bloc<S>,S>(blocType: BlocType<B,S>): B|undefined{
        for(let bloc of this.blocs){
            if(bloc.constructor.name === blocType.name){
                return bloc as B;
            }
        }
    }

    static of<B extends Bloc<S>,S>(blocType: BlocType<B,S>, startingElement:HTMLElement, otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): B|undefined{
        let currentEl: HTMLElement|null = startingElement;
        while(currentEl){
            if(otherSearchCriteria(currentEl)){
                if(currentEl instanceof BlocsProvider){
                    let found_bloc = currentEl._findBloc<B,S>(blocType);
                    if(found_bloc){
                        return found_bloc;
                    }
                } else if(currentEl instanceof BlocBuilder && currentEl.bloc?.constructor.name === blocType.name){
                    return currentEl.bloc;
                }
            }
            let t: HTMLElement|null = currentEl.parentNode as HTMLElement;
            if(t instanceof ShadowRoot){
                t = t.host as HTMLElement;
            }
            currentEl = t;
        }
    }

    _build(){
        let gui = this.builder();
        render(gui,this.shadowRoot!);
     }
 
 
     abstract builder(): TemplateResult;
}