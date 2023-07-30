import { nothing, TemplateResult,render} from "./template";

interface FoundBlocDetails{
    bloc:Bloc<any>;
    subscription_id:number;
}

/**
 * Searches for a Bloc in the DOM tree. Starts from the staring element and searches all the way up in the DOM tree.
 * @param blocName 
 * @param startingElement 
 * @returns 
 */
export function findBloc<B extends Bloc<any>>(blocName:string, startingElement:Node):B|undefined{
    let currentEl:Node|null = startingElement;
    while(currentEl){
        if(currentEl instanceof ListenerWidget){
            if(currentEl.blocname === blocName && currentEl.bloc){
                return currentEl.bloc as B;
            }else if(currentEl.hasBloc(blocName)){
                return currentEl.getHostedBloc(blocName) as B;
            }
        }
        let t:any= currentEl.parentNode;
        if(t instanceof ShadowRoot){
            t = t.host;
        }
        currentEl = t;
    }
}
  
/**
 * Business logic component which manages a particular state
 */
export class Bloc<S>{
    private listeners:Record<number,Function>={};
    private listenerCount=0;
    private foundBlocs:Record<string,FoundBlocDetails>={};
    hostElement:HTMLElement|undefined;
    private _state:S;
    /**
     * The name its given in hosted machine
     */
    private _blocName?:string;

    constructor(protected initState:S,protected listenToBlocs:string[]=[]){
            this._state=initState;
    }

    
    public get state() : S {
        return this._state;
    }

    protected reactToStateChangeFrom(blocName:string,newState:any){

    }


    _subscribe(newStateHandler:Function){
        let id = ++this.listenerCount;
        this.listeners[id]=newStateHandler;
        return id;
    }

    _unsubscribe(subscription_id:number){
        delete this.listeners[subscription_id];
    }


    onConnection(hostElement:HTMLElement,blocName:string){
        this._blocName=blocName;
        this.hostElement=hostElement;

        //subscribe to blocs to whom this bloc wants to listen to
        for(let bn of this.listenToBlocs){
            const bloc = findBloc(bn,hostElement);
            if(!bloc){
                throw `[BLOC-THEM]: ${JSON.stringify({blocName,requiredBloc:bn, host: hostElement.tagName, msg: "RequiredBloc not found"})}`;
            }
            const newStateHandler=(newState:any)=>{
                this.reactToStateChangeFrom(bn,newState);
            };

            this.foundBlocs[bn]={
                bloc,
                subscription_id: bloc._subscribe(newStateHandler)
            };
        }
    }

    onDisconnection(){
        for(let bn of this.listenToBlocs){
            let {bloc,subscription_id} = this.foundBlocs[bn];
            bloc._unsubscribe(subscription_id);
        }
    }

    /**
     * Emit function to publish new states of this Bloc
     * @param newState 
     */
    emit(newState:S){
        this._state=newState;
        for(let sid in this.listeners){
            try{
                this.listeners[sid](newState);
            }catch(e){
                console.error(`[BLOC-THEM]: User mistake, listeners should catch their own errors!`);
            }
        }
    }
}

export abstract class ListenerWidget<S> extends HTMLElement{
    blocname?:string;
    _hostedblocs:Record<string,Bloc<any>>;
    root:Node;
    bloc?:Bloc<S>;
    subscription_id:number=0;

    
    public set hostedblocs(v : Record<string,Bloc<any>>) {
        this._hostedblocs = v;
        this.connectedCallback();
    }
    

    constructor({blocName,hostedBlocs={},isShadow=false}:{blocName?:string,hostedBlocs?:Record<string,Bloc<any>>,isShadow?:boolean}={}){
        super();
        this.blocname=blocName;
        if(this.hasAttribute("bloc")){
            this.blocname=this.getAttribute("bloc")!;
        }
        this._hostedblocs=hostedBlocs;
        if(isShadow || this.hasAttribute("shadow")){
            this.attachShadow({mode: "open"});
            this.root=this.shadowRoot!;
        }else{
            this.root=this;
        }
    }

    connectedCallback(){
        //notify hosted blocs about connection
        for(let blocName in this._hostedblocs){
            try{
                this._hostedblocs[blocName].onConnection(this,blocName);
            }catch(e){
                console.error(e);
            }
        }

        if(this.blocname){
            this.bloc=findBloc(this.blocname,this);
            if(!this.bloc){
                throw `[BLOC-THEM]: ${JSON.stringify({requiredBloc:this.blocname,host: this.tagName, msg: "RequiredBloc not found"})}`;
            }
            this.subscription_id=this.bloc._subscribe((newState:S)=>{
                this.rebuild(newState);
            });
        }
        this.rebuild(this.bloc?.state);
    }

    disconnectedCallback(){
        if(this.bloc){
            this.bloc._unsubscribe(this.subscription_id);
        }
        for(let blocName in this._hostedblocs){
            this._hostedblocs[blocName].onDisconnection();
        }
    }

    hasBloc(blocName:string):boolean{
        if(this._hostedblocs[blocName]){
            return true;
        }else{
            return false;
        }
    }

    getHostedBloc(blocName:string){
        return this._hostedblocs[blocName];
    }

    rebuild(newState?:S){
        let t = this.build(newState);
        if(!t){
            t=nothing;
        }
        render(this.root,t);
    }

    abstract build(state?:S):TemplateResult|undefined;
}