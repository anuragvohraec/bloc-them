const templateCache = new Map();

const ASNT="{{st}}";
const ESNT="{{ste}}";
const TSNT=`<!--${ASNT}--> <!--${ESNT}-->`;

export interface TemplateResult{
    _id:any;
    templates:TemplateStringsArray,
    values:any[];
}

/**
 * Create HTM templates and store them in cache
 * @param {*} templates 
 * @param  {...any} values 
 * @returns 
 */
export function html(templates:TemplateStringsArray,...values:unknown[]):TemplateResult{
    const t = document.createElement("template");
    let s = "";
    let n =templates.length;

    for(let t of templates){
        n--;
        if(t.trim().endsWith("=")){
            s+=(t+ASNT);
        }else{
            if(n!==0){
                s+=(t+TSNT);
            }else{
                s+=t;
            }
        }
    }
    t.innerHTML=s;//templates.join(TEXT_SENTINEL);
    if(!templateCache.has(templates)){
        templateCache.set(templates,t);
    }
    return {
        _id:values,
        templates,
        values  
    };
}

function createStaticIterationList(targetNode:Node){
    const result=[];
    const itr = document.createNodeIterator(targetNode);
    //skip the root node
    itr.nextNode();
    
    let currentNode = itr.nextNode();
    while(currentNode){
        if(currentNode.nodeType===Node.COMMENT_NODE && currentNode.textContent===ASNT){
            //this means it do not have been render even once: fresh node
            //@ts-ignore
            if(!currentNode.endCommentNode){
                //@ts-ignore
                currentNode.endCommentNode=currentNode.nextSibling.nextSibling;
            }
            //@ts-ignore
            if(currentNode.isSpecial){
                //move till 
                let cn = itr.nextNode();
                //@ts-ignore
                while(cn!==currentNode.endCommentNode){
                    cn = itr.nextNode();
                }
            }
            result.push(currentNode);
        }else if(currentNode.nodeType===Node.ELEMENT_NODE){
            //@ts-ignore
            if(currentNode.stAt){
                result.push(currentNode);
            }else{
                //@ts-ignore
                for(let i=0;i<currentNode.attributes.length;i++){
                    //@ts-ignore
                    let currentAttribute = currentNode.attributes[i];
                    if(currentAttribute.value===ASNT){
                        result.push(currentNode);
                        break;
                    }else if(currentAttribute.value.match(TSNT)){
                        result.push(currentNode);
                        break;
                    }
                }
            }
            //if its custom element simply skip all its child
            //@ts-ignore
            // if(customElements.get(currentNode.tagName.toLowerCase()) && !currentNode.shadowRoot){
            //     let cn = itr.nextNode();
            //     while(currentNode.contains(cn)){
            //         cn=itr.nextNode();
            //     }
            //     currentNode=cn;
            // }

            //@ts-ignore
            if(currentNode?.tagName==="STYLE"){
                //@ts-ignore
                if(currentNode.textContent.match(TSNT)||currentNode.script){
                    //@ts-ignore
                    if(!currentNode.script){
                        //@ts-ignore
                        currentNode.script=currentNode.textContent;
                    }
                    if(result[result.length-1]!==currentNode){
                        result.push(currentNode);
                    }
                }
            }
        }
        currentNode=itr.nextNode();
    }
    return result;
}


function createNodeListBetween(startCommentNode:Node){
    //@ts-ignore
    const itr = document.createNodeIterator(startCommentNode.parentNode);
    let currentNode = itr.referenceNode;
    while(currentNode!==startCommentNode){
        //@ts-ignore
        currentNode = itr.nextNode();
    }
    //@ts-ignore
    currentNode = itr.nextNode();
    const result=[];
    //@ts-ignore
    while(currentNode && currentNode!==startCommentNode.endCommentNode){
        if(currentNode.nodeType===Node.COMMENT_NODE && currentNode.textContent===ASNT){
            //this means it do not have been render even once: fresh node
            //@ts-ignore
            if(!currentNode.endCommentNode){
                //@ts-ignore
                currentNode.endCommentNode=currentNode.nextSibling.nextSibling;
            }
            //@ts-ignore
            if(currentNode.isSpecial){
                //move till 
                let cn = itr.nextNode();
                //@ts-ignore
                while(cn!==currentNode.endCommentNode){
                    cn = itr.nextNode();
                }
            }
            result.push(currentNode);
        }else if(currentNode.nodeType===Node.ELEMENT_NODE){
            //@ts-ignore
            if(currentNode.stAt){
                result.push(currentNode);
            }else{
                //@ts-ignore
                for(let i=0;i<currentNode.attributes.length;i++){
                    //@ts-ignore
                    let currentAttribute = currentNode.attributes[i];
                    if(currentAttribute.value===ASNT){
                        result.push(currentNode);
                        break;
                    }else if(currentAttribute.value.match(TSNT)){
                        result.push(currentNode);
                        break;
                    } 
                }
            }

            // //if its custom element simply skip all its child
            // //@ts-ignore
            // if(customElements.get(currentNode.tagName.toLowerCase()) && !currentNode.shadowRoot){
            //     let cn = itr.nextNode();
            //     while(currentNode.contains(cn)){
            //         cn=itr.nextNode();
            //     }
            //     //@ts-ignore
            //     currentNode=cn;
            // }

            //@ts-ignore
            if(currentNode?.tagName==="STYLE"){
                //@ts-ignore
                if(currentNode.textContent.match(TSNT)||currentNode.script){
                    //@ts-ignore
                    if(!currentNode.script){
                        //@ts-ignore
                        currentNode.script=currentNode.textContent;
                    }
                    if(result[result.length-1]!==currentNode){
                        result.push(currentNode);
                    }
                }
            }
        }
        //@ts-ignore
        currentNode = itr.nextNode();
    }
    return result;
}


function replaceInBetweenCommentNode(startCommentNode:any,nodeToInsert:any){
    let cNode=startCommentNode.nextSibling;
    const parent = startCommentNode.parentNode;
    while(cNode && !(cNode === startCommentNode.endCommentNode)){
        let nNode = cNode.nextSibling
        parent.removeChild(cNode);
        cNode=nNode;
    }
    if(!nodeToInsert){
        nodeToInsert=document.createTextNode("");
    }
    parent.insertBefore(nodeToInsert,startCommentNode.endCommentNode);
}


function createEmptyFragment(){
    const df = new DocumentFragment();
    
    let startCommentNode = document.createComment(ASNT);
    let endCommentNode = document.createComment(ESNT);

    //@ts-ignore
    startCommentNode.endCommentNode=endCommentNode;

    df.appendChild(startCommentNode);
    
    let emptyTextNode = document.createTextNode("");
    df.appendChild(emptyTextNode);
    
    df.appendChild(endCommentNode);
    //@ts-ignore
    df.startCommentNode=startCommentNode;
    return df;
}


export function render(target:Node,templateResult:TemplateResult){
    const {templates,values}=templateResult;

    //@ts-ignore
    //if templates have changed then clean up the target node
    if(target.prevTemplates!==templates){
        //@ts-ignore
        target.prevTemplates=templates;
        const t = Array.from(target.childNodes);
        for(let c of t){
            target.removeChild(c);
        }

        const tNode = templateCache.get(templates);
        const node = tNode.content.cloneNode(true);
        target.appendChild(node);
    }

    const applicableNodes = createStaticIterationList(target);
    workOnThisNodes(applicableNodes,values);
}
//@ts-ignore
function workOnThisNodes(applicableNodes,values){
    let index=0;
    for(let currentNode of applicableNodes){
        if(currentNode.nodeType === Node.COMMENT_NODE){
            //case of comments nodes
            const pv = currentNode.value;
            const cv = values[index];

            if(pv!==cv){
                currentNode.value=cv;

                if(cv && cv.templates && cv.values){
                    currentNode.isSpecial=true;
                    if(cv.templates !== pv?.templates){
                        const tn = new DocumentFragment();
                        render(tn,cv);

                        replaceInBetweenCommentNode(currentNode,tn);
                    }else{
                        if(cv.values!==pv?.values){
                            const apn = createNodeListBetween(currentNode);
                            workOnThisNodes(apn,cv.values);
                        }
                    }
                }else if(Array.isArray(cv)){
                    currentNode.isSpecial=true;
                    const startCommentNode=currentNode;
                    const endCommentNode=startCommentNode.endCommentNode;
                    let prevValues=pv;
                    if(!prevValues){
                        prevValues=[];
                    }
                    
                    /*
                     Concept:
                     <!--{{st}}-->//startCommentNode
                        //array elements
                        <!--{{st}}-->
                            //render for the value
                        <!--{{ste}}-->
                     <!--{{ste}}-->//endCommentNode

                    old is an array of {_id,templates,values,startCommentNode}
                    old and new array are compared
                    if(old and new id do not match){
                        if(old do not have an entry): then a new is created and added
                        else : old is completely rendered
                    }
                     */

                    let k=0;
                    for(let nTR of cv){
                        let oTR = prevValues[k];
                        //nTR and oTR are of type : {_id,templates,values,startCommentNode}
                        
                        if(nTR._id!==oTR?._id){
                        //if id mismatch than needs a render

                            if(!oTR){
                            //if there is no oldTemplateResult : create new one
                                let d = new DocumentFragment();
                                render(d,nTR);

                                const ef = createEmptyFragment();
                                //@ts-ignore
                                replaceInBetweenCommentNode(ef.startCommentNode,d);

                                startCommentNode.parentNode.insertBefore(ef,endCommentNode);

                                //set a reference to this newly created nodes start comment node in nTR
                                //@ts-ignore
                                nTR.startCommentNode=ef.startCommentNode;
                            }else{
                            //else if oldTemplateResult exist: update its content with new render
                                let d = new DocumentFragment();
                                render(d,nTR);

                                replaceInBetweenCommentNode(oTR.startCommentNode,d);
                                //set a reference to old start comment node in nTR
                                nTR.startCommentNode=oTR.startCommentNode;
                            }
                        }else{
                            //copying old start comment node to new list
                            nTR.startCommentNode=oTR.startCommentNode
                        }
                        k++;
                    }

                    //if k is less than the length of previous values
                    //this nodes are no more required and hence will be removed
                    if(k<prevValues.length-1){
                        let cn = prevValues[k].startCommentNode;
                        while(cn!==endCommentNode){
                            let nn = cn.nextSibling;
                            //remove all nodes till you see end comment node
                            startCommentNode.parentNode.removeChild(cn);
                            cn=nn;
                        }
                    }
                }else if(cv && cv.constructor===UnsafeHTML){
                    const df = document.createElement('template');
                    df.innerHTML = (cv as UnsafeHTML).value;
                    replaceInBetweenCommentNode(currentNode,df.content); 
                }else{
                    const tn = new Text(cv);
                    replaceInBetweenCommentNode(currentNode,tn); 
                }
            }
            index++;
        }else{
            
            if(!currentNode.stAt){
                currentNode.stAt={};
                
                //case of nodes with attributes
                const t =[];
                for(let currentAttribute of currentNode.attributes){
                    if(currentAttribute.value===ASNT){
                        currentNode.stAt[currentAttribute.name]=undefined;
                        t.push(currentAttribute.name);
                    }else if(currentAttribute.value.match(TSNT)){
                        currentNode.stAt[currentAttribute.name]=currentAttribute.value;
                        t.push(currentAttribute.name);
                    }
                }
                for(let a of t){
                    currentNode.removeAttribute(a);
                }  
            }

            for(let atName in currentNode.stAt){
                let pv = currentNode.stAt[atName];
                let cv = values[index];

                if(pv!==cv){
                    
                    const propertyName = atName.substring(1);
                    //cv can be falsy
                    if(atName.startsWith(".")){
                        currentNode[propertyName]=cv;
                    }else if(atName.startsWith("@")){
                        if(pv){
                            if(pv instanceof Function){
                                currentNode.removeEventListener(propertyName,pv);
                            }else if(pv.handleEvent){
                                currentNode.removeEventListener(propertyName,pv.handleEvent);
                            }
                        }
                        if(cv){
                            if(cv instanceof Function){
                                currentNode.addEventListener(propertyName,cv);
                            }else if(cv.handleEvent && cv.handleEvent instanceof Function){
                                currentNode.addEventListener(propertyName,cv.handleEvent,cv.capture);
                            }
                        }
                    }else if(atName.startsWith("?")){
                        if(cv){
                            const s =cv?cv.toString():"";
                            currentNode.setAttribute(propertyName,s);
                        }else{
                            currentNode.removeAttribute(propertyName);
                        }
                    }else{
                        if(pv && pv.match(TSNT)){
                            let s = ""+pv;
                            let f = pv.matchAll(TSNT);
                            for(let t of f){
                                s=s.replace(TSNT,cv);
                                index++;
                                cv=values[index];
                            }
                            index--;
                            cv=pv;
                            currentNode.setAttribute(atName,s);
                        }else{
                            const s =cv?cv.toString():"";
                            currentNode.setAttribute(atName,s);
                        }
                    }

                    currentNode.stAt[atName]=cv;
                }

                index++;
            }
            
            if(currentNode.script){
                let s = ""+currentNode.script;
                //@ts-ignore
                let f = s.matchAll(TSNT);
                const before = index;
                for(let t of f){
                    let cv = values[index];
                    s=s.replace(TSNT,cv);
                    index++;
                }
                if(before!==index){
                    currentNode.textContent=s;
                }
            }
        }
    }
}

export interface IDFunction{
    (item:any):any;
}

export interface TemplateFunction{
    (item:any,index:number,_id:any):TemplateResult
}

export function repeat(items:any[],idFunction:IDFunction,templateFunction:TemplateFunction){
    const result:TemplateResult[]=[];
    items.forEach((item,index)=>{
        const _id = idFunction(item);
        const templateResult=templateFunction(item,index,_id);
        templateResult._id=_id;
        result.push(templateResult);
    });
    return result;
}

class UnsafeHTML{
    constructor(private _value:any){
    }
    
    public get value() : any{
        return this._value;
    }
    
}

// export function unsafeHTML(stringItem:string):TemplateResult{
//     const t = document.createElement("template");
//     t.innerHTML=stringItem;
//     if(!templateCache.has(stringItem)){
//         templateCache.set(stringItem,t);
//     }
//     return {
//         _id:[],
//         values:[],
//         //@ts-ignore
//         templates:stringItem
//     }
// }

export function unsafeHTML(value:any):UnsafeHTML{
    return new UnsafeHTML(value);
}

export const nothing=html``;