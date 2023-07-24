import { Bloc } from "./bloc";
import { render, TemplateResult } from "../template";
import { BlocBuilder, MultiBlocsReactiveWidget } from "./bloc-builder";
import {BaseBlocsHTMLElement} from '../base';

/**
 * This function can help skip or pick some elements even when they are valid elements capable of providing the bloc
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
        if(this._blocsMap){
            for(let b in this._blocsMap){
              Promise.resolve().then(()=>this._blocsMap[b].onConnection(this));
            }
        }
    }

    disconnectedCallback(){
        if(this._blocsMap){
            for(let b in this.blocsMap){
                this.blocsMap[b].onDisconnection();
            }
        }
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
                    if(currentEl.blocName === nameOfBlocToSearch && currentEl.bloc){
                        return currentEl.bloc;
                    }else if(currentEl.blocBuilderConfig?.blocs_map?.[nameOfBlocToSearch]){
                        return currentEl.blocBuilderConfig.blocs_map[nameOfBlocToSearch] as B;
                    }
                }else if(currentEl instanceof MultiBlocsReactiveWidget){
                    let foundBloc = currentEl.blocsMap[nameOfBlocToSearch];
                    if(foundBloc){
                        return foundBloc as B;
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
        render(this.getRootElement(),gui);
     }
 
 
     abstract builder(): TemplateResult;
}
