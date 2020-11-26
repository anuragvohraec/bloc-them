/**
 * Pure functions:
 * 1. One which will not modify the state themselves.
 * 2. No calculation at all in Pure functions. There only objective must be to set values, which can triggers sate change of your elements.
 */
interface PureFunction<S>{
    (newState: S):void;
  }
  
interface _PureFunctionMap<S>{
[key: string]: PureFunction<S>;
}

  
/**
 * Bloc : Business Logic component, is a place where in you place all your business logic.
 * Its holds a state and all business logic which tries to modify this state should be inside this.
 * This exposes a single method emit to external Api, which must be used to emit new states.
 */  
export abstract class Bloc<S>{
    private _listener_id_ref=1;
    private _listeners: _PureFunctionMap<S> ={};
    private _state: S

    constructor(initState: S){
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
                this._listeners[`${l}`](newState);
            }catch(e){
                console.log(`Listener ${l} do not have try catch bloc. It throws error which is not caught in its pure function.`);
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
   * @param listeningId Unsubscribe to state litsening state changes
   */
  _stopListening(listeningId: string): void{
    if(listeningId && this._listeners[listeningId]){
      delete this._listeners[listeningId];
    }
  }
  
}
