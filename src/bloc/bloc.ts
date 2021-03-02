import { HasNameAndHost } from '../base';
import { BlocsProvider } from './blocs-provider';

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

interface BlocDependencies{
  blocs?:string[];
  repos?:string[];
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
    protected _reposMap:Record<string,HasNameAndHost>={};
    protected _blocsMap:Record<string,Bloc<any>>={};

    
    public get reposMap() : Record<string,HasNameAndHost> {
      return this._reposMap;
    }

    
    public get blocsMap() : Record<string,HasNameAndHost> {
      return this._blocsMap;
    }
    
    getBloc<B extends Bloc<any>>(bloc_name:string){
      let b:Bloc<any>|undefined = this._blocsMap[bloc_name];
      if(!b){
        b = BlocsProvider.of(bloc_name,this.hostElement);
        if(!b){
          throw `<${this.name}> bloc requires bloc: ${bloc_name}! to function!\r\nPossible reason:\r\ngetBloc method called in constructor\r\n${bloc_name} bloc is not present in the reverse DOM hierarchy!`;
        }else{
          this._blocsMap[bloc_name]=b;
        }
      }
      return b as B;
    }

    getRepo<R extends HasNameAndHost>(repo_name:string){
      let r:HasNameAndHost|undefined = this._blocsMap[repo_name];
      if(!r){
        r = BlocsProvider.of(repo_name,this.hostElement);
        if(!r){
          throw `<${this.name}> bloc requires repository: ${repo_name}! to function!\r\nPossible reason:\r\ngetRepo method called in constructor of bloc\r\n${repo_name} repository is not present in the reverse DOM hierarchy!`;
        }else{
          this._reposMap[repo_name]=r;
        }
      }
      return r as R;
    }

    /**
     * 
     * @param initState this is mostly used for rendering loading place holder [grey boxes].
     * @param blocDependencies  this are searched after their host has connected: during the connected callBack.
     * There for ths dependencies will not be available in the constructor and must not be called in the constructor phase of the bloc.
     */
    constructor(protected initState: S,public blocDependencies?:BlocDependencies){
        super();
        this._state=initState;
        if(this.blocDependencies){
          deepFreeze(this.blocDependencies);
        }
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
   _listen(aPureFunction: PureFunction<S>): string{
    let key: string = `${this._listener_id_ref}`;
    this._listeners[key]=aPureFunction;
    this._listener_id_ref++;
    return key;
  }

  /**
   * 
   * @param listeningId Unsubscribe to state listening state changes
   */
  _stopListening(listeningId: string): void{
    if(listeningId && this._listeners[listeningId]){
      delete this._listeners[listeningId];
    }
  }
  
}