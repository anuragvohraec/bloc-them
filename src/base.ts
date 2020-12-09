
export interface BlocThemUseAttribute{
    [key:string]:string;
}


export class BaseBlocsHTMLElement extends HTMLElement{
    private _useAttr?: BlocThemUseAttribute;
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        let t1 = this.getAttribute("use");
        this._useAttr = BaseBlocsHTMLElement.parseUseAttribute(t1);
    }

    
    public get useAttribute() : BlocThemUseAttribute|undefined {
        return this._useAttr;
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
