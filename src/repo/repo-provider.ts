import { TemplateResult, render } from "lit-html";
import { OtherBlocSearchCriteria } from "../bloc/blocs-provider";

interface _ClassTypes{
    name: string
}

export abstract class ReposProvider extends HTMLElement{
    constructor(private repos: any[]){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: 'open'});
        this._build();
    }

    _findARepo<R, T extends _ClassTypes>(typeOfRepo: T): R|undefined{
        for(let r of this.repos){
            if(r.constructor.name === typeOfRepo.name){
                return r;
            }
        }
    }

    static of<R,T extends _ClassTypes>(repoType: T, startingElement: HTMLElement,otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): R|undefined{
        let currentEl: HTMLElement|null = startingElement;
        while(currentEl){
            if(otherSearchCriteria(currentEl)){
                if(currentEl instanceof ReposProvider){
                    let found_repo = currentEl._findARepo<R,T>(repoType);
                    if(found_repo){
                        return found_repo;
                    }
                }
            }
            let t: HTMLElement|null = currentEl.parentElement;
            currentEl = t;
        }
    }

    _build(){
        let gui = this.builder();
        render(gui,this.shadowRoot!);
     }
 
     abstract builder(): TemplateResult;
}