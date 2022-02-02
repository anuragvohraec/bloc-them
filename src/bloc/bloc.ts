import { HasNameAndHost } from '../base';
import { BlocsProvider, OtherBlocSearchCriteria } from './blocs-provider';

/**
 * Pure functions:
 * 1. One which will not modify the state themselves.
 * 2. No calculation at all in Pure functions. There only objective must be to set values, which can triggers sate change of your elements.
 */
export interface PureFunction<S>{
    (newState: S):void;
    _ln_name:string;
  }
  
interface _PureFunctionMap<S>{
[key: string]: PureFunction<S>;
}

export function deepFreeze(obj:any){
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};
  
/**
 * Bloc : Business Logic component, is a place where in you place all your business logic.
 * Its holds a state and all business logic which tries to modify this state should be inside this.
 * This exposes a single method emit to external Api, which must be used to emit new states.
 */  
export abstract class Bloc<S> extends HasNameAndHost{
    private _listener_id_ref=1;
    private _listeners: _PureFunctionMap<S> ={};
    private _state: S;
    protected _blocsMap:Record<string,Bloc<any>>={};
    
    public get blocsMap() : Record<string,Bloc<any>> {
      return this._blocsMap;
    }

    static search<B extends Bloc<any>>(nameOfBlocToSearch:string, startingElement:HTMLElement, otherSearchCriteria: OtherBlocSearchCriteria=(currentEl: HTMLElement)=>true): B|undefined{
      return BlocsProvider.search<B>(nameOfBlocToSearch,startingElement,otherSearchCriteria);
    }

    /**
     * key is bloc name
     */
    protected foundListenedBlocs:Record<string,{bloc:Bloc<any>,subscriber_id:string}>={};
  
    /**
     * Called right after an HTMLElement is connected
     * @param ctx 
     */
    public onConnection(ctx:HTMLElement){
      this.hostElement=ctx;
      for(let b of this.listenToBlocs){
          let fb = Bloc.search(b,this.hostElement);
          if(!fb){
            this.foundListenedBlocs={};
            throw `${this._name.toUpperCase()} hosted on ${ctx.tagName} depends upon ${b} bloc, which is not found the parent DOMs!`
          }
          this.foundListenedBlocs[b]={
            bloc:fb,
            subscriber_id:""
          };
      }

      //now lets listen to them
      for(let b of Object.keys(this.foundListenedBlocs)){
          let t:any = (newState:any)=>{
              this.reactToStateChangeFrom(b,newState);
          };
          t._ln_name=b;
          this.foundListenedBlocs[b].subscriber_id=this.foundListenedBlocs[b].bloc._subscribe(t);
      }
    }

    /**
     * Called before disconnection of HTMLElement
     */
    public onDisconnection(){
      //stop listening
      for(let b of Object.keys(this.foundListenedBlocs)){
        this.foundListenedBlocs[b].bloc._unsubscribe(this.foundListenedBlocs[b].subscriber_id);
      }
    }
    
    /**
     * Override 
     * @param blocName 
     * @param newState 
     */
    protected reactToStateChangeFrom(blocName:string,newState:any){

    }

    getBloc<B extends Bloc<any>>(bloc_name:string){
      let b:Bloc<any>|undefined = this._blocsMap[bloc_name];
      if(!b){
        b = BlocsProvider.search(bloc_name,this.hostElement);
        if(!b){
          throw `<${this.name}> bloc requires bloc: ${bloc_name}! to function!\r\nPossible reason:\r\ngetBloc method called in constructor\r\n${bloc_name} bloc is not present in the reverse DOM hierarchy!`;
        }else{
          this._blocsMap[bloc_name]=b;
        }
      }
      return b as B;
    }


    /**
     * 
     * @param initState this is mostly used for rendering loading place holder [grey boxes].
     * @param listenToBlocs onConnection of this bloc's host element, this bloc will start subscribe to state change from this blocs (present in the parent chain).
     * If a bloc is not found it will throw error
     */
    constructor(protected initState: S,protected listenToBlocs:string[]=[]){
        super();
        this._state=initState;
    }

    
    public get state() : S {
        return this._state;
    }
    
    /**
     * 
     * @param newState Emits new state
     */
    emit(newState: S){
        this._state = newState;
        //emit new state should inform all listeners
        for(let l of Object.keys(this._listeners)){
            try{
                if(this._listeners[`${l}`]){
                  this._listeners[`${l}`](newState);
                }
            }catch(e){
                console.log(`Listener ${this._listeners[l]?._ln_name} do not have try catch bloc. It throws error which is not caught in its pure function.`);
                console.error(e);
            }
        }
    }

    /**
    * 
    * @param aPureFunction Used to subscribe to state changes
    */
   _subscribe(aPureFunction: PureFunction<S>): string{
    let key: string = `${this._listener_id_ref}`;
    this._listeners[key]=aPureFunction;
    this._listener_id_ref++;
    return key;
  }

  /**
   * 
   * @param listeningId Unsubscribe to state listening state changes
   */
  _unsubscribe(listeningId: string): void{
    if(listeningId && this._listeners[listeningId]){
      delete this._listeners[listeningId];
    }
  }
  
}