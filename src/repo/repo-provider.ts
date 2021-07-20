import { TemplateResult, render } from "lit-html";
import { OtherBlocSearchCriteria } from "../bloc/blocs-provider";
import {BaseBlocsHTMLElement, HasNameAndHost} from '../base';

export abstract class Repository extends HasNameAndHost{

}

export abstract class ReposProvider extends BaseBlocsHTMLElement{
    constructor(private _repoMap: Record<string,Repository>){
        super();
        for(let rn of Object.keys(this._repoMap)){
            const repo = this._repoMap[rn];
            repo.hostElement=this;
        }
        Object.freeze(this._repoMap);
    }

    
    public get reposMap() : Record<string,Repository> {
        return this._repoMap;
    }
    

    connectedCallback(){
        this._build();
    }

    /**
     * 
     * @param repoName 
     * @param startingElement 
     * @param otherSearchCriteria 
     * @returns 
     * @deprecated Use search instead
     */
    static of<R extends Repository>(repoName:string, startingElement: HTMLElement,otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): R|undefined{
        return this.search(repoName,startingElement,otherSearchCriteria);
    }

    static search<R extends Repository>(repoName:string, startingElement: HTMLElement,otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): R|undefined{
        let currentEl: HTMLElement|null = startingElement;
        while(currentEl){
            if(otherSearchCriteria(currentEl)){
                if(currentEl instanceof ReposProvider){
                    let found_repo = currentEl.reposMap[repoName];
                    if(found_repo){
                        return found_repo  as R;
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
