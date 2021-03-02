import { Bloc } from './bloc/bloc';
import { BlocsProvider } from './bloc/blocs-provider';
import { ReposProvider } from './repo/repo-provider';

export function _setDependenciesForABloc(forBloc: Bloc<any>, context: HTMLElement){
    const repo_not_present:string[]=[];
    const bloc_not_present:string[]=[];

    if(forBloc.blocDependencies?.repos){
        for(let rn of forBloc.blocDependencies.repos){
            const repo  = ReposProvider.of(rn,context);
            if(!repo){
                repo_not_present.push(`<${context.tagName}> uses bloc: ${forBloc.name}, which requires <repository>: ${rn}! to function!`);
            }else{
                forBloc.reposMap[rn]=repo;
            }
        }
    }
    if(forBloc.blocDependencies?.blocs){
        for(let bn of forBloc.blocDependencies.blocs){
             const bloc = BlocsProvider.of(bn,context);
             if(!bloc){
                bloc_not_present.push(`<${context.tagName}> uses bloc: ${forBloc.name}, which requires <bloc>: ${bn}! to function!`);
             }else{
                forBloc.blocsMap[bn]=bloc;
             }
        }
    }

    let error_msg:string='';
    if(repo_not_present.length>0){
        const t = repo_not_present.join("\r\n");
        error_msg+=t;
    }
    if(bloc_not_present.length>0){
        const t = bloc_not_present.join("\r\n");
        error_msg+=t;
    }

    if(error_msg.length>0){
        console.trace(error_msg)
        throw error_msg;
    }
}
