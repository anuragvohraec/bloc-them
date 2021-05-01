# Features to be added in next release
1. SleeperCell BlocBuilder,  they become active and search for their blocs only when required. Helpfull in case of large iterative components.
An iterative Bloc Provider. So a single bloc can hold an array of blocs to be required by its child sleeper BlocBuilders.
Instead may be a iterative bloc listener which render itself only when bloc issues its index.