
 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [Architecture](https://ji-podhead.github.io/protobuffctl/architecture) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |
 
## Codebase Organization

This section provides an overview of the project's file structure and the purpose of each file.
**File-Structure:**
```
├── main.js
├── src/
│   ├── components.js
│   ├── protoUtils.js
│   ├── protobuffctl.js
│   └── shared.js
├── test/
│   ├── serverTest.js
│   ├── test.js
│   └── test.proto
├── util/
│   ├── cli.js
│   ├── middleware.js
│   ├── service_worker.js
│   └── utils.js
└── util/dashboard/
```


### Main Files

- `main.js`: This is the main entry point of the application. It initializes the application and sets up the necessary configurations.

### Source Files

- `src/`: This directory contains the core source code files.
 - `components.js`: Manages the creation and manipulation of Protobuf components such as message types, fields, services, and enums.
 - `protoUtils.js`: Contains utility functions for working with Protobuf files, such as parsing and serialization.
 - `protobuffctl.js`: The core module that integrates all functionalities of Protobuffctl, including API server, CLI commands, and file generation.
 - `shared.js`: Contains shared utilities and constants used across the application.

### Test Files

- `test/`: This directory contains test files to ensure the reliability and correctness of the application.
 - `serverTest.js`: Tests for the API server and its endpoints.
 - `test.js`: General tests for the application's functionalities.
 - `test.proto`: Protobuf test files used for testing Protobuf functionalities.

### Utility Files

- `util/`: This directory contains utility files that support the application's operations.
 - `cli.js`: Implements the command-line interface for Protobuffctl, allowing users to interact with the application through the terminal.
 - `middleware.js`: Contains middleware functions for handling requests and responses, ensuring ACID compliance and preventing race conditions.
 - `service_worker.js`: Manages background tasks and operations, such as file watching and automatic file generation.
 - `utils.js`: General utility functions used throughout the application.

### Dashboard Files

- `util/dashboard/`: This directory contains files related to the built-in dashboard for demo, debugging, and testing purposes.

## Flow Chart
```
Architecture:                                                                
                                ┌──────────────────────┐                    
                  ┌───────────┐ │                      │                    
                  │ Dashboard │ │  external Database   │                    
                  └─────▲─────┘ │                      │                    
                        │       └──────────▲───────────┘                    
                        │                  │                                
                        │                  │                                
                  ┌─────▼─────┐   ┌────────▼────────┐  ┌─────────────┐      
                  │           │   │                 │  │             │      
                  │ Api Server◄───►   Api Wrapper   ◄──►     CLI     │      
                  │           │   │                 │  │             │      
                  └───────────┘   └────────▲────────┘  └─────────────┘      
                                           │                                
                                  ┌────────▼─────────┐                      
                                  │                  │                      
                                  │  Service-Worker  │                      
                                  │                  │                      
                                  └────────▲─────────┘   ┌─────────────────┐
                                           │             │                 │
                                           │             │ HashLookUpTable │
                                    ┌──────▼───────┐ ┌───►                 │
                                    │              │ │   └─────────────────┘
                                    │ Protobuffctl ◄─┤                      
                                    │              │ │     ┌─────────────┐  
                                    └──────▲───────┘ │     │             │  
ER - modell:                               │         └─────►  Relations  │  
                                           │               │             │  
                                     ┌─────▼───────┐       └─────────────┘  
                ┌──────────┐         │             │                        
    ┌───────────►ProtoFiles├─────────►             │                        
    │           └─▲──▲─────┘         │             │                        
    │             │  │               │             │                        
    │             │  │               │             │                        
    │             │  │  ┌────────┐   │             │                        
    │             │  └──┤Services├───►             │                        
    │             │     └───▲────┘   │             │                        
    │             │         │        │             │                        
    │             │         │        │  Component  │                        
    │             │     ┌───┴───┐    │             │                        
    │             │     │Methods├────►             │                        
    │             │     └───▲───┘    │      -      │                        
    │             │         │        │             │                        
    │             │         │        │             │                        
    │        ┌────┴┐        │        │  Registry   |                       
    │        │Types├────────┴────────►             │                        
    │        └▲───▲┘                 │             │                        
    │         │   │                  │             │                        
    │   ┌─────┴┐  │                  │             │                        
    │   │Nested├──┼──────────────────►             │                        
    │   └──▲─▲─┘  │                  │             │                        
 ┌──┴──┐   │ │   ┌┴─────┐            │             │                        
 │Enums├───┘ └───┤Fields├────────────►             │                        
 └─┬───┘         └──────┘            │             │                        
   │                                 │             │                        
   └─────────────────────────────────►             │                        
                                     └─────────────┘                        
```
