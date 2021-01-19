import { TemplateResult, render } from "lit-html";
import { OtherBlocSearchCriteria } from "../bloc/blocs-provider";
import {BaseBlocsHTMLElement, HasName} from '../base';

export abstract class ReposProvider extends BaseBlocsHTMLElement{
    constructor(private repos: any[]){
        super();
    }

    connectedCallback(){
        this._build();
    }

    _findARepo<R extends HasName>(repoName:string): R|undefined{
        for(let r of this.repos){
            if(r.constructor.name === repoName){
                return r;
            }
        }
    }

    static of<R extends HasName>(repoName:string, startingElement: HTMLElement,otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): R|undefined{
        let currentEl: HTMLElement|null = startingElement;
        while(currentEl){
            if(otherSearchCriteria(currentEl)){
                if(currentEl instanceof ReposProvider){
                    let found_repo = currentEl._findARepo<R>(repoName);
                    if(found_repo){
                        return found_repo;
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
