import { Bloc } from "./bloc";
import { TemplateResult, render, html } from "lit-html";
import { BlocType, BlocsProvider } from "./blocs-provider";
import {BaseBlocsHTMLElement} from '../base';


interface BuildWhenFunction<S>{
    (previousState: S, newState: S): boolean;
}

export interface BlocBuilderConfig<B extends Bloc<S>, S>{
  useThisBloc?:B;
  buildWhen?: BuildWhenFunction<S>;
  /**
   * default is true, that is pre-build step is performed only once for each render/build, on connection of this element to DOM.
   */
  preBuildOnlyOnce?:boolean;
}

export abstract class BlocBuilder<B extends Bloc<S>, S> extends BaseBlocsHTMLElement{
    private _bloc: B|undefined;
    private _subscriptionId!: string;
    private _prevState!: S;
    private _configs: BlocBuilderConfig<B,S>;

  
    constructor(private blocType: BlocType<B,S>, configs?: BlocBuilderConfig<B,S>){
      super();
      let defaultConfig: BlocBuilderConfig<B,S>={
        preBuildOnlyOnce: true,
        buildWhen: (preState: S, newState:S)=>{
          if(newState!==preState){
              return true;
          }else{
              return false;
          }
        }
      }

      this._configs={...defaultConfig, ...configs};
    }

    
    public get bloc() : B|undefined {
        return this._bloc;
    }
    

    connectedCallback(){
      this._initialize();
    }
    

    async _initialize(){
      //find the bloc
      this._bloc = this._configs.useThisBloc ? this._configs.useThisBloc: BlocsProvider.of<B,S>(this.blocType,this);

      //if bloc is found;
      if(this._bloc){
        this._prevState = this._bloc.state;
        
        this._subscriptionId = this._bloc._listen((newState: S)=>{
            if(this._configs.buildWhen!(this._prevState, newState)){
              this._prevState = newState;
              this._build(newState);
            }
          
        });
        this._build(this._prevState);
      }else{
        throw `No parent found which has ${this.blocType.name} bloc`;
      }
    }
  
    disconnectedCallback(){
      this._bloc!._stopListening(this._subscriptionId);
    }
    
    async _build(state: S){
      if(!this._prebuild_step_done){
        render(this.prebuilder(), this.shadowRoot!); 
        await this.prebuild_blo(state);
        if(this._configs!.preBuildOnlyOnce){
          this._prebuild_step_done=true;
        }
      }
      let gui = this.builder(state);
      render(gui,this.shadowRoot!);
    }

    abstract builder(state: S): TemplateResult;
}