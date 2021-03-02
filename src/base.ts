import { Bloc } from './bloc/bloc';
import { BlocsProvider } from './bloc/blocs-provider';
import { ReposProvider } from './repo/repo-provider';

export interface BlocThemUseAttribute{
    [key:string]:string;
}

export abstract class HasNameAndHost{
    private _hostElement!: HTMLElement;
    protected abstract _name:string;
    
    public get name() : string {
        return this._name;
    }

    
    public get hostElement() : HTMLElement{
        return this._hostElement;
    }
    
    public set hostElement(v : HTMLElement) {
        this._hostElement = v;
    }
}


export class BaseBlocsHTMLElement extends HTMLElement{
    private _useAttr?: BlocThemUseAttribute;
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        let t1 = this.getAttribute("use");
        this._useAttr = BaseBlocsHTMLElement.parseUseAttribute(t1);
    }

    protected _setDependenciesForABloc(forBloc: Bloc<any>){
        const repo_not_present:string[]=[];
        const bloc_not_present:string[]=[];

        if(forBloc.blocDependencies?.repos){
            for(let rn of forBloc.blocDependencies.repos){
                const repo  = ReposProvider.of(rn,this);
                if(!repo){
                    repo_not_present.push(`<${this.tagName}> uses bloc: ${forBloc.name}, which requires repository: ${rn}! to function!`);
                }else{
                    forBloc.reposMap[rn]=repo;
                }
            }
        }
        if(forBloc.blocDependencies?.blocs){
            for(let bn of forBloc.blocDependencies.blocs){
                 const bloc = BlocsProvider.of(bn,this);
                 if(!bloc){
                    bloc_not_present.push(`<${this.tagName}> uses bloc: ${forBloc.name}, which requires bloc: ${bn}! to function!`);
                 }else{
                    forBloc.blocsMap[bn]=bloc;
                 }
            }
        }
        let error_msg:string='';
        if(repo_not_present.length>1){
            const t = repo_not_present.join("\r\n");
            error_msg.concat(error_msg,t);
        }
        if(bloc_not_present.length>1){
            const t = bloc_not_present.join("\r\n");
            error_msg.concat(error_msg,t);
        }
        if(error_msg.length>0){
            throw error_msg;
        }
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
