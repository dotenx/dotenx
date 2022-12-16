This project is the API that offers the core functionalities of the application. Almost everything other than the background jobs is implemented in this project.



# Directory structure
(generated using `tree -d | pbcopy`)
```
.
├── app
├── config
├── controllers
│   ├── crud
│   ├── database
│   ├── execution
│   ├── health
│   ├── integration
│   ├── internalController
│   ├── marketplace
│   ├── oauth
│   ├── objectstore
│   ├── predefinedMiniTask
│   ├── predefinedTask
│   ├── profile
│   ├── project
│   ├── trigger
│   ├── uibuilder
│   │   └── publishutils
│   └── userManagement
├── db
│   ├── dbutil
│   └── migrate
│       └── postgresql
├── miniTasks
├── models
├── oauth
│   └── provider
├── pkg
│   ├── formatter
│   ├── middlewares
│   └── utils
│       └── functions
├── services
│   ├── crudService
│   ├── databaseService
│   ├── executionService
│   ├── integrationService
│   ├── internalService
│   ├── marketplaceService
│   ├── notifyService
│   ├── oauthService
│   ├── objectstoreService
│   ├── predefinedTaskService
│   ├── projectService
│   ├── queueService
│   ├── triggersService
│   ├── uibuilderService
│   ├── userManagementService
│   └── utopiopsService
└── stores
    ├── authorStore
    ├── databaseStore
    ├── integrationStore
    ├── marketplaceStore
    ├── oauthStore
    ├── objectstoreStore
    ├── pipelineStore
    ├── projectStore
    ├── redisStore
    ├── triggerStore
    ├── uibuilderStore
    └── userManagementStore
```

63 directories, 403 files (generated using `tree | tail -n 1 | pbcopy`)



# Functionalities


# Conventions
**MUST**: These conventions have to be followed<br/>
**SHOULD**: These conventions have to be followed unless there is a good reason not to and given having enough comments that explain the reason<br/>
**MAY**: These conventions are recommendations and can be ignored if there is a good reason not to<br/>
**OPTIONAL**: These conventions are optional and can be ignored if there is a good reason not to<br/>
## Dependencies

1. If a service needs another service, the dependency must be passed as a parameter to the function where the dependency is used (example: DeleteProject function in projectService)
2. If a service uses multiple stores, they should be added as properties to the service interface


## Comments

C1. All exported functions and methods must have a comment that explains what the function does and what the parameters are with the exception of the functions implementing an interface.
R: Exported functions should be usable without having to look at the implementation.

C2. All the files unless extremely small should have a comment at the top that explains what the file does. The comment should be placed right below the imports.
R. This helps in understanding the purpose of the file and also helps in generating documentation for the API.

C3. The functions of an interface should be commented in the interface itself and not in the implementation.
R. The consumers, use the interface in their code and not the implementation. The intellisense in the IDEs will show the comments of the interface and not the implementation.

## Directory structure
We have organized the code based on the functionalities. Each functionality has its own directory. This approach has some advantages and disadvantages. The main advantage is that it is easy to find the code for a specific functionality.

The main disadvantage is that not always there is a clear separation between functionalities and in some cases, the code for a functionality is spread across multiple directories. You must be careful not to create circular dependencies between directories. One common scenario is that one service uses another service and both services are in different directories. In this case, you must pass the dependency as a parameter to the function where the dependency is used.

Another disadvantage is that the end to end implementation of a functionality is spread across multiple layers (controller, service, store). This makes it harder to understand the end to end implementation of a functionality. However, we use the same names for the functions in the different layers. This makes it easier to find the implementation of a functionality in the different layers.


C1: Each folder should have a `README.md` file that explains the purpose of the folder and the files in it.<br/>
R: If you add a new folder, it means you're grouping files together that are related to each other and implement a specific functionality and a `README.md` can give a general overview of the functionality without having to read the entire code. Also, this way the explanation of the code is in the same place as the code itself and it's easier to find it.

C2: You should add a utility function that's specific to the functions in a single file to the same file. If the function is used in multiple files, it should be moved to a utility file. Each folder should not have more than one utility file (See ###Files/C3).<br/>
R: This way, the code is easier to read and understand. If you have to look at multiple files to understand a single function, it's harder to understand the code and it's harder to maintain it.



## Naming
Naming conventions are important because they make the code easier to read and understand. If you have to look at the code to understand what a variable or a function does, it's harder to understand the code and it's harder to maintain it.

### Directories

C1: If the directory contains go files, it should be named in camelCase.
R: These directories map to the package names and using camelCase makes it easier to read the package name.

### Files

C1: All the files must be named in snake_case.<br/>
R: The files are named in snake_case to make it easier to read the file names.

C2: If the file implements a handler, the name should end with `_handler.go`.<br/>
R: It is easier to identify the files that implement the handlers.

C3: If the file contains helper functions used by multiple files, the name should end with `_utils.go`.<br/>
R: It is easier to identify the files that contain helper functions used by multiple files.

### Functions

### Variables

C1: All the variables must be named in camelCase.<br/>
R: The variables are named in camelCase to make it easier to read the variable names.

### Interfaces
