import { html, nothing, TemplateResult } from "lit-html";
import { Bloc } from "./bloc";
import { BlocBuilder,BuildWhenFunction} from "./bloc-builder";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

export interface StateBuilderFunction<S>{
    (state:S):TemplateResult
}
export interface GuiMakerConfig<S>{
    tag_prefix?:string;
    tag_name:string;
    builder_function:StateBuilderFunction<S>;
    bloc_name:string;
    blocs_map?:Record<string,Bloc<any>>;
    buildWhen?: BuildWhenFunction<S>;
}

export class GuiMaker{
   static make<S>(config:GuiMakerConfig<S>):TemplateResult{
    let tag_name = this.define(config);
    let t  = `<${tag_name}></${tag_name}>`;
    return html`${unsafeHTML(t)}`;
   }
   
   private static tag_name_from_config<S>(config:GuiMakerConfig<S>):string{
       return `${config.tag_prefix?config.tag_prefix+"-"+config.tag_name:config.tag_name}`;
   }

   /**
    * Will define a tag and return its name.
    * You can add properties on this tags and use it in blocs later on.
    * @param config 
    * @returns tag-prefix-tag-name
    */
   static define<S>(config:GuiMakerConfig<S>){
    class InnerBuilderClass<B extends Bloc<S>> extends BlocBuilder<B,S>{
        constructor(){
            super(config.bloc_name,{
                blocs_map: config.blocs_map,
                buildWhen: config.buildWhen
            });
        }
        builder(state: S): TemplateResult {
            return config.builder_function(state);
        }
    }

    let tag_name = this.tag_name_from_config(config);

    if(!customElements.get(tag_name)){
        customElements.define(tag_name,InnerBuilderClass);
    }

    return tag_name;
   }
}

export abstract class ApexBloc extends Bloc<TemplateResult>{
    constructor(initState?:TemplateResult){
        super(initState??nothing as TemplateResult);
    }
    abstract notifyAttributeChange<T>(newValue:T):void;
}

class ApexWidgetBuilder extends BlocBuilder<ApexBloc,TemplateResult>{
    private _prop: any;

    public get prop(): any {
        return this._prop;
    }
    public set prop(value: any) {
        this._prop = value;
        if(value){
            this.bloc?.notifyAttributeChange(value);
        }
    }

    builder(state: TemplateResult): TemplateResult {
        return state;
    }
}
customElements.define("bt-apex",ApexWidgetBuilder);