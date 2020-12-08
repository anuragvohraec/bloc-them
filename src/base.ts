import { html, TemplateResult } from 'lit-html';

export interface BlocThemUseAttribute{
    [key:string]:string;
}


export class BaseBlocsHTMLElement extends HTMLElement{
    private _useAttr?: BlocThemUseAttribute;
    protected _prebuild_step_done: boolean = false;

    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        let t1 = this.getAttribute("use");
        this._useAttr = BaseBlocsHTMLElement.parseUseAttribute(t1);
    }

    
    public get useAttribute() : BlocThemUseAttribute|undefined {
        return this._useAttr;
    }

    /**
     * Business logic to be run before final build (pre-build is run before this however)
     * 
     * Override this method if you want to perform some business logic before the final render. Meanwhile this one performs the prebuild step,
     * a prebuilder method will be used to render something to screen, instead of build process.
     * before render.  **state** should not be modified during this phase.
     * 
     * * For BlocsProvider and RepoProvider, no state will be supplied.
     * * For BlocBuilder however state will be supplied.
     * @param state 
     */
    async prebuild_blo<S>(state?: S){

    }

    /**
     * Things to display before build, say a loading bar?!
     * This executed first after connection and then prebuild_blo (prebuild business logic) is executed.
     */
    prebuilder():TemplateResult{
      return html``;
    }
    

    static parseUseAttribute(attrString: string|null):BlocThemUseAttribute|undefined{
        if(attrString){
            let result:BlocThemUseAttribute={};
            let t1 = attrString.split(";");
            for(let t2 of t1){
                let t3 = t2.split(":");
                if(t3.length===2){
                    result[t3[0].trim()]=t3[1].trim();
                }
            }
            return result;
        }
    }
}