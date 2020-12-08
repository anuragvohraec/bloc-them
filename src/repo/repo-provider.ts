import { TemplateResult, render } from "lit-html";
import { OtherBlocSearchCriteria } from "../bloc/blocs-provider";
import {BaseBlocsHTMLElement} from '../base';

interface _ClassTypes{
    name: string
}

export abstract class ReposProvider extends BaseBlocsHTMLElement{
    constructor(private repos: any[], private preBuildOnlyOnce:boolean=true){
        super();
    }

    connectedCallback(){
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
            let t: HTMLElement|null = currentEl.parentNode as HTMLElement;
            if(t instanceof ShadowRoot){
                t = t.host as HTMLElement;
            }
            currentEl = t;
        }
    }

    async _build(){
        if(!this._prebuild_step_done){
            render(this.prebuilder(), this.shadowRoot!); 
            await this.prebuild_blo();
            if(this.preBuildOnlyOnce){
              this._prebuild_step_done=true;
            }
        }
        let gui = this.builder();
        render(gui,this.shadowRoot!);
     }
 
     abstract builder(): TemplateResult;
}