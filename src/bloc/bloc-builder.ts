import { Bloc, PureFunction } from "./bloc";
import { TemplateResult, render } from "lit-html";
import {BlocsProvider, OtherBlocSearchCriteria } from "./blocs-provider";
import {BaseBlocsHTMLElement} from '../base';
import {_setDependenciesForABloc} from '../utils';


export interface BuildWhenFunction<S>{
    (previousState: S, newState: S): boolean;
}

export interface BlocBuilderConfig<B extends Bloc<S>, S>{
  /**
   * @deprecated Use blocs_map instead
   */
  useThisBloc?:B;
  buildWhen?: BuildWhenFunction<S>;
  otherSearchCriteria?: OtherBlocSearchCriteria;
  search_blocs?:string[];
  blocs_map?:Record<string,Bloc<any>>
}

export abstract class BlocBuilder<B extends Bloc<S>, S> extends BaseBlocsHTMLElement{
    private _bloc: B|undefined;
    private _subscriptionId!: string;
    private _prevState!: S;
    private _found_blocs:Record<string,Bloc<any>>={};
    
    static stateChangeBuildWhenFunction<S>(preState: S, newState:S){
      if(newState!==preState){
        return true;
      }else{
          return false;
      }
    }

    constructor(protected nameOfBlocToSearch:string,public configs?: BlocBuilderConfig<B,S>){
      super();

      if(!this.configs){
        this.configs={};
      }

      if(!this.configs.buildWhen){
        this.configs.buildWhen = BlocBuilder.stateChangeBuildWhenFunction;
      }
      if(this.configs.useThisBloc){
        this.configs.useThisBloc.hostElement=this;
        this._bloc = this.configs.useThisBloc; 
      }
      if(this.configs.blocs_map){
        for(let k of Object.keys(this.configs.blocs_map)){
          this.configs.blocs_map[k].hostElement=this;
          if(k === this.nameOfBlocToSearch){
            this._bloc = this.configs.blocs_map[k] as B;
          }
        }
      }
    }

    /**
     * Do not use this to modify the found blocs
     */
    public get found_blocs():Record<string,Bloc<any>>{
      return this._found_blocs;
    }
    
    public get bloc() : B|undefined {
        return this._bloc;
    }

    
    public get state() : S|undefined {
      return this.bloc?.state;
    }
    
    

    connectedCallback(){
      this._initialize();
      //finding and setting search blocs
      if(!this.configs!.search_blocs){
        this.configs!.search_blocs=[];
      }

      _setDependenciesForABloc(this.bloc!,this);

      this.configs!.search_blocs.push(this.nameOfBlocToSearch);

      for(let bn of this.configs!.search_blocs){
        const bloc = BlocsProvider.of(bn,this);
        if(!bloc){
          throw `<${this.tagName}> requires bloc: ${bn}! to function!`;
        }else{
          this._found_blocs[bn]=bloc;
        }
      }
    }

    getBloc<B extends Bloc<any>>(bn:string):B{
      const b = this._found_blocs[bn] as B;
      if(!b){
        throw `<${this.tagName}> requires bloc: ${bn}! to function!`;
      }else{
        return b;
      }
    }
    

    _initialize(){
      //find the bloc
      if(!this._bloc){
        this._bloc = this.configs!.useThisBloc ? this.configs!.useThisBloc: BlocsProvider.of<B>(this.nameOfBlocToSearch,this,this.configs!.otherSearchCriteria);
      }
      
      //if bloc is found;
      if(this._bloc){
        this._prevState = this._bloc.state;
        const l : PureFunction<S>= (newState: S)=>{
          try{
            if(this.configs!.buildWhen!(this._prevState, newState)){
              this._build(newState);
              this._prevState = newState;
            }
          }catch(e){
            console.error(`${l._ln_name} listener function has caught an error. Which mostly happens when your builder function is throwing error, which is not what should be done/happen!`);
            console.error(e);
          }
      };
        l._ln_name = this.tagName;
        if(this.id){
          l._ln_name+=`#${this.id}`;
        }
        this._subscriptionId = this._bloc._listen(l);
        this._build(this._prevState);
      }else{
        throw `No parent found which has ${this.nameOfBlocToSearch} bloc`;
      }
    }
  
    disconnectedCallback(){
      this._bloc!._stopListening(this._subscriptionId);
    }
    
    _build(state: S){
       let gui = this.builder(state);
       render(gui,this.shadowRoot!);
    }

    abstract builder(state: S): TemplateResult;
}
