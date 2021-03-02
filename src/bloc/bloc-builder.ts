import { Bloc, PureFunction } from "./bloc";
import { TemplateResult, render } from "lit-html";
import {BlocsProvider, OtherBlocSearchCriteria } from "./blocs-provider";
import {BaseBlocsHTMLElement} from '../base';
import {_setDependenciesForABloc} from '../utils';


interface BuildWhenFunction<S>{
    (previousState: S, newState: S): boolean;
}

export interface BlocBuilderConfig<B extends Bloc<S>, S>{
  useThisBloc?:B;
  buildWhen?: BuildWhenFunction<S>;
  otherSearchCriteria?: OtherBlocSearchCriteria;
  search_blocs?:string[];
}

export abstract class BlocBuilder<B extends Bloc<S>, S> extends BaseBlocsHTMLElement{
    private _bloc: B|undefined;
    private _subscriptionId!: string;
    private _prevState!: S;
    private _configs: BlocBuilderConfig<B,S>;
    private _found_blocs:Record<string,Bloc<any>>={};
  
    constructor(protected nameOfBlocToSearch:string, configs?: BlocBuilderConfig<B,S>){
      super();
      let defaultConfig: BlocBuilderConfig<B,S>={
        buildWhen: (preState: S, newState:S)=>{
          if(newState!==preState){
              return true;
          }else{
              return false;
          }
        }
      }

      this._configs={...defaultConfig, ...configs};
      if(this._configs.useThisBloc){
        this._configs.useThisBloc.hostElement=this;
      }
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
      if(!this._configs.search_blocs){
        this._configs.search_blocs=[];
      }

      _setDependenciesForABloc(this.bloc!,this);

      this._configs.search_blocs.push(this.nameOfBlocToSearch);

      for(let bn of this._configs.search_blocs){
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
      this._bloc = this._configs.useThisBloc ? this._configs.useThisBloc: BlocsProvider.of<B>(this.nameOfBlocToSearch,this,this._configs.otherSearchCriteria);

      //if bloc is found;
      if(this._bloc){
        this._prevState = this._bloc.state;
        const l : PureFunction<S>= (newState: S)=>{
          try{
            if(this._configs.buildWhen!(this._prevState, newState)){
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
