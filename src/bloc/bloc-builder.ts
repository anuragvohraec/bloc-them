import { Bloc, PureFunction } from "./bloc";
import { TemplateResult, render } from "lit-html";
import {BlocsProvider, OtherBlocSearchCriteria } from "./blocs-provider";
import {BaseBlocsHTMLElement} from '../base';

export interface BuildWhenFunction<S>{
    (previousState: S, newState: S): boolean;
}

export interface BlocBuilderConfig<S>{
  buildWhen?: BuildWhenFunction<S>;
  otherSearchCriteria?: OtherBlocSearchCriteria;
  blocs_map?:Record<string,Bloc<any>>
}

export abstract class BlocBuilder<B extends Bloc<S>, S> extends BaseBlocsHTMLElement{
    private _bloc: B|undefined;
    private _subscriptionId!: string;
    private _prevState!: S;
    protected nameOfBlocToSearch:string;

    get blocName():string{
      return this.nameOfBlocToSearch;
    }

    static stateChangeBuildWhenFunction<S>(preState: S, newState:S){
      if(newState!==preState){
        return true;
      }else{
          return false;
      }
    }

    public configs:BlocBuilderConfig<S>;

    public set blocBuilderConfig(bConfig:BlocBuilderConfig<S>){
      if(bConfig.buildWhen){
        this.configs.buildWhen=bConfig.buildWhen;
      }
      if(bConfig.otherSearchCriteria){
        this.configs.otherSearchCriteria=bConfig.otherSearchCriteria;
      }

      //merges new config onto old config
      if(bConfig.blocs_map){
        if(!this.configs.blocs_map){
          this.configs.blocs_map={};
        }
        this.configs.blocs_map={...this.configs.blocs_map,...bConfig.blocs_map};

        if(bConfig.blocs_map[this.nameOfBlocToSearch]){
          this._bloc = this.configs.blocs_map[this.nameOfBlocToSearch] as B;
          this._build(this._bloc.state);
        }
      }
    }

    /**
     * 
     * @param nameOfBlocToSearch Either provide this or provide bloc attribute
     * @param configs 
     */
    constructor(nameOfBlocToSearch?:string,configs?: BlocBuilderConfig<S>){
      super();
      
      const userSuggestedBlocName = this.getAttribute("bloc");
      nameOfBlocToSearch=userSuggestedBlocName?userSuggestedBlocName:nameOfBlocToSearch;

      if(!nameOfBlocToSearch){
        throw `[BLOC-THEM] : No bloc name provided for: ${this.tagName}`;
      }

      this.nameOfBlocToSearch= nameOfBlocToSearch;

      if(!configs){
        this.configs={};
      }else{
        this.configs=configs;
      }

      if(!this.configs.buildWhen){
        this.configs.buildWhen = BlocBuilder.stateChangeBuildWhenFunction;
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

    
    public get bloc() : B|undefined {
        return this._bloc;
    }
    
    public get state() : S|undefined {
      return this.bloc?.state;
    }
    
    

    protected connectedCallback(){
      this._initialize();

      if(this.configs?.blocs_map){
        for(let b in this.configs.blocs_map){
          const bloc= this.configs.blocs_map[b];
          setImmediate(()=>{
            bloc.onConnection(this);
          })
        }
      }
    }

    getBloc<B extends Bloc<any>>(bn:string){
      return BlocsProvider.search<B>(bn,this);
    }
    

    _initialize(){
      //find the bloc
      if(!this._bloc){
        this._bloc = BlocsProvider.search<B>(this.nameOfBlocToSearch,this,this.configs!.otherSearchCriteria);
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
        this._subscriptionId = this._bloc._subscribe(l);
        this._build(this._prevState);
      }else{
        throw `[BLOC-THEM] : No parent found which has ${this.nameOfBlocToSearch} bloc`;
      }
    }
  
    disconnectedCallback(){
      if(this.configs?.blocs_map){
        for(let b in this.configs.blocs_map){
          this.configs.blocs_map[b].onDisconnection();
        }
      }

      this._bloc!._unsubscribe(this._subscriptionId);
    }
    
    _build(state: S){
       let gui = this.builder(state);
       render(gui,this.shadowRoot!);
    }

    abstract builder(state: S): TemplateResult;
}


export abstract class MultiBlocsReactiveWidget<S> extends BaseBlocsHTMLElement{
  protected found_blocs:Record<string,Bloc<any>>={};
  protected state?:S;
  protected subscribed_states: Record<string, any> = {};
  private listener_ids:Record<string,string>={}
  
  
  public get blocsMap() : Record<string,Bloc<any>> {
    return this.config.blocs_map;
  }
  
  public getBloc<B extends Bloc<any>>(blocName:string):B{
      let result = this.blocsMap[blocName] as B;
      if(!result){
        result=this.found_blocs[blocName] as B;
        if(!result){
          result=BlocsProvider.search<B>(blocName,this) as B;
        }
      }
      return result;
  }

  constructor(protected config:{
    blocs_map:Record<string,Bloc<any>>,
    subscribed_blocs:string[]
  }){
    super();
    if(this.config.blocs_map){
      for(let k of Object.keys(this.config.blocs_map)){
        this.config.blocs_map[k].hostElement=this;
      }
    }
  }

  connectedCallback(){
    if(this.isConnected){
      for(let bloc_name of this.config.subscribed_blocs){
        let foundBloc = Bloc.search<Bloc<any>>(bloc_name,this);
        if(!foundBloc){
          throw `[BLOC-THEM] : ${this.tagName} depends upon bloc ${bloc_name} , but is not found in the DOM tree`;
        }else{
          this.found_blocs[bloc_name] = foundBloc;
        }
      }

      //then lets listen for new states
      //listening to bloc states
      for(let bloc_name in this.found_blocs){
        this.subscribed_states[bloc_name]=this.found_blocs[bloc_name].state;

        let t:any = (newState:any)=>{
          this.subscribed_states={...this.subscribed_states};
          this.subscribed_states[bloc_name]=newState;
          this._build();
        };
        t._ln_name = this.tagName;

        this.listener_ids[bloc_name]=this.found_blocs[bloc_name]._subscribe(t);
      }

      //lets do the first build
      this._build();
      
      if(this.config.blocs_map){
        for(let b in this.config.blocs_map){
          let bloc=this.config.blocs_map[b];
          setImmediate(()=>{
            bloc.onConnection(this);
          })
        }
      }
    }
  }

  disconnectedCallback(){
    if(this.config.blocs_map){
      for(let b in this.config.blocs_map){
        this.config.blocs_map[b].onDisconnection();
      }
    }

    //stop listening for state change from subscribed blocs
    for(let bloc_name in this.found_blocs){
      try{
        this.found_blocs[bloc_name]._unsubscribe(this.listener_ids[bloc_name]);
      }finally{
        continue;
      }
    }
  }

  abstract convertSubscribedStatesToReactiveState(subscribed_states?: Record<string, any>):S|undefined;
  
  protected build_when(prev_state?:S,new_state?:S):boolean{
    return prev_state!==new_state;
  }

  abstract build(state?:S):TemplateResult;

  protected _build(){
    let newState = this.convertSubscribedStatesToReactiveState(this.subscribed_states);

    if(this.build_when(this.state,newState)){
        this.state = newState;
        let gui :TemplateResult = this.build(this.state);
        render(gui,this.shadowRoot!);
    }
  }
}