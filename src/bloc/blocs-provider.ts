import { Bloc } from "./bloc";
import { render, TemplateResult } from "lit-html";
import { BlocBuilder } from "./bloc-builder";
import {BaseBlocsHTMLElement} from '../base';
import {_setDependenciesForABloc} from '../utils';

// export  interface BlocType< B extends Bloc<S>,S>{
//     new(...args: any[]): B
// }

/**
 * This function can help skip or pik some elements even when they are valid elements capable of providing the bloc
 */
export interface OtherBlocSearchCriteria{
    (currentEl: HTMLElement): boolean;
}

export abstract class BlocsProvider extends BaseBlocsHTMLElement{

    /**
     * 
     * @param _blocsMap case sensitive keys.
     */
    constructor(private _blocsMap:Record<string,Bloc<any>>={}){
        super();
        for(let bn of Object.keys(this._blocsMap)){
            const bloc = this._blocsMap[bn];
            bloc.hostElement=this;
        }
        Object.freeze(this._blocsMap);
    }

    
    public get blocsMap() : Record<string,Bloc<any>> {
        return this._blocsMap;
    }
    

    connectedCallback(){
        this._build();
        for(let bloc_name of Object.keys(this._blocsMap)){
            const bloc = this._blocsMap[bloc_name];
            _setDependenciesForABloc(bloc,this);
        }
    }

    /**
     * 
     * @param nameOfBlocToSearch 
     * @param startingElement 
     * @param otherSearchCriteria 
     * @returns 
     * @deprecated Use search instead
     */
    static of<B extends Bloc<any>>(nameOfBlocToSearch:string, startingElement:HTMLElement, otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): B|undefined{
        return this.search(nameOfBlocToSearch,startingElement,otherSearchCriteria);
    }

    /**
     * Added this method as its more logicaly named. 
     * @param nameOfBlocToSearch 
     * @param startingElement 
     * @param otherSearchCriteria 
     * @returns 
     */
    static search<B extends Bloc<any>>(nameOfBlocToSearch:string, startingElement:HTMLElement, otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): B|undefined{
        let currentEl: HTMLElement|null = startingElement;
        while(currentEl){
            if(otherSearchCriteria(currentEl)){
                if(currentEl instanceof BlocsProvider){
                    let found_bloc = currentEl.blocsMap[nameOfBlocToSearch];
                    if(found_bloc){
                        return found_bloc as B;
                    }
                } else if(currentEl instanceof BlocBuilder){
                    if(currentEl.bloc?.name === nameOfBlocToSearch){
                        return currentEl.bloc;
                    }else if(currentEl.configs?.blocs_map?.[nameOfBlocToSearch]){
                        return currentEl.configs.blocs_map[nameOfBlocToSearch] as B;
                    }
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
