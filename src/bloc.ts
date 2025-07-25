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
export function findBloc<B extends Bloc<any>>(blocName:string, startingElement:Element|undefined):B|undefined{
    let currentEl:Node|undefined = startingElement;
    while(currentEl){
        if(currentEl instanceof ListenerWidget){
            if(currentEl.blocname === blocName && currentEl._bloc){
                return currentEl._bloc as B;
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
    private _blocName?: string | undefined;
    public get blocName(): string | undefined {
        return this._blocName;
    }

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

            //this check gives it to listen to new blocs on run time
            if(!this.foundBlocs[bn]){
                const newStateHandler=(newState:any)=>{
                    this.reactToStateChangeFrom(bn,newState);
                };
    
                this.foundBlocs[bn]={
                    bloc,
                    subscription_id: bloc._subscribe(newStateHandler)
                };
            }
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
                console.error(e);
            }
        }
    }
}

export abstract class ListenerWidget<S=any> extends HTMLElement{
    blocname?:string;
    _hostedblocs:Record<string,Bloc<any>>;
    root:Node;
    _bloc?:Bloc<S>;
    subscription_id:number=0;
    private _timeouts:Record<string,number>;

    
    public set hostedblocs(v : Record<string,Bloc<any>>) {
        this._hostedblocs = v;
        this.connectedCallback();
    }

    bloc<B extends Bloc<S>>(){
        return this._bloc as B;
    }
    

    constructor({blocName,hostedBlocs={},isShadow=false}:{blocName?:string,hostedBlocs?:Record<string,Bloc<any>>,isShadow?:boolean}={}){
        super();
        this._timeouts={};
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
            this._bloc=findBloc(this.blocname,this);
            if(!this._bloc){
                throw `[BLOC-THEM]: ${JSON.stringify({requiredBloc:this.blocname,host: this.tagName, msg: "RequiredBloc not found"})}`;
            }
            this.subscription_id=this._bloc._subscribe((newState:S)=>{
                this.rebuild(newState);
            });
        }
        setTimeout(()=>{this.rebuild(this._bloc?.state);});
    }

    disconnectedCallback(){
        if(this._bloc){
            this._bloc._unsubscribe(this.subscription_id);
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



    bindInputToState(e:InputEvent, validator?:Function, delay:number=0){
        ///@ts-ignore
        const input :HTMLInputElement = e.currentTarget;
        const name = input.getAttribute("name");

        if(input && name){
            if(delay){
                if(this._timeouts[name]){
                    clearTimeout(this._timeouts[name]);
                }
                //@ts-ignore
                this._timeouts[name]=setTimeout(()=>{
                    this.applyValidation(input, name, validator);
                },delay);
            }else{
                this.applyValidation(input, name,validator);
            }
        }
    }

    private applyValidation(input: HTMLInputElement, name: string,validator?: Function) {
        const currentBlocState = this.bloc().state;
        
        if (validator) {
            //@ts-ignore
            let validity: Record<string, any> = currentBlocState["_validity"];
            if (!validity) {
                validity = {};
                //@ts-ignore
                currentBlocState["_validity"] = validity;
            }
            const validation_result = validator(input.value);
            if (validation_result) {
                validity[name] = validation_result;
            } else {
                //@ts-ignore
                delete validity[name];
                if(Object.keys(validity).length===0){
                    //@ts-ignore
                    delete currentBlocState["_validity"];
                }
            }
        }

        //@ts-ignore
        currentBlocState[name] = input.value;

        this.bloc().emit({ ...currentBlocState});
    }
}