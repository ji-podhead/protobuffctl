# protobuffctl  [![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)
![NPM Downloads](https://img.shields.io/npm/dw/protobuffctl)


- `Protobuffctl` offers an  [API](https://ji-podhead.github.io/protobuffctl/) that enables you to automate all protobuf functions.
- Manage `message types`, `fields`, `services`,  `methods` and `enums` by using **cli commands**, or **Api-Server**.
- Stores all Components in the **local Componentregistry**. <br>
- Sync with **other registries** like gitey, or PostgreSQL.
- **Roll back** to old protofile, or to an registry state using historical `.config` file, <br> or by using a external DB just like with **version control**.<br>
- **Preview** the Protofile-Code before actually building it and export any Component to **JSON**.
- Automatically generates the corresponding `protobuf files` when making changes to the protofiles.<br>
- Comes with **Dashboard** for demo, debugging and **testing**.
- The middleware will provide acid and **prevents race conditions**.
- The implemented **Api-Server** lets you create your own **User Interface** to manage `Protocollbuffers` 
---
#                      Getting Started
**Install:**
 
```JavaScript
npm i protobuffctl
```
**Docs:**  [see docs](https://ji-podhead.github.io/protobuffctl/) <br>
**CLI Guide:** [see docs/cli-guide](https://github.com/ji-podhead/protobuffctl/blob/main/docs/CLI-guide.md) 
 
---
##                         ER MODEL        
```                                                                                          
                                    ┌─────────────┐                          
               ┌──────────┐         │             │                          
   ┌───────────►ProtoFiles├─────────►             │                          
   │           └─▲──▲─────┘         │             │                                                                   
   │             │  │  ┌────────┐   │             │                          
   │             │  └──┤Services├───►             │                          
   │             │     └───▲────┘   │             │       ┌─────────────────┐
   │             │         │        │             │       │                 │
   │             │         │        │  Component  ◄───────┤ HashLookUpTable │
   │             │     ┌───┴───┐    │             │       │                 │
   │             │     │Methods├────►             │       └─────────────────┘
   │             │     └───▲───┘    │      -      │                          
   │             │         │        │             │         ┌─────────────┐  
   │             │         │        │             │         │             │  
   │        ┌────┴┐        │        │  Registry   ◄─────────┤  Relations  │  
   │        │Types├────────┴────────►             │         │             │  
   │        └▲───▲┘                 │             │         └─────────────┘  
   │         │   │                  │             │                          
   │   ┌─────┴┐  │                  │             │                          
   │   │Nested├──┼──────────────────►             │                          
   │   └──▲─▲─┘  │                  │             │                          
┌──┴──┐   │ │   ┌┴─────┐            │             │                          
│Enums├───┘ └───┤Fields├────────────►             │                          
└─┬───┘         └──────┘            │             │                                                
  └─────────────────────────────────►             │                          
                                    └─────────────┘                          
```
##                    Architecture
```              
              📊                       📚                         
┌──────────────┐ ┌──────────────────────┐  
│  Dashboard   │ │                      │                                                    
└──────▲───────┘ │  external Database   │                                                   
       │         │                      │
       |         └──────────▲───────────┘                                                              
       │      🌐            |      🔄                 💻                                    
  ┌────▼───────┐    ┌───────▼───────┐    ┌─────────────┐                                    
  │            │    │               │    │             │                                     
  │ Api Server ◄────►  Api Wrapper  ◄────┤     CLI     │                                    
  │            │    │               │    │             │                                    
  └────────────┘    └───────▲───────┘    └─────────────┘                                    
                            │       👷                                                       
                    ┌───────▼────────┐                                                       
                    │                │                                                      
                    │ Service-Worker │                                                      
                    │                │                                                      
                    └───────▲────────┘                                                      
                            │                  🗄️                                            
          ┌─────────────────▼───────────────────┐                                            
          │                                     │                                           
          │   Protobuffctl - ComponentRegistry  │                                           
          │                                     │                                           
          └─────────────────────────────────────┘
```





---
###                      Update
- serialize **Protobuff Registry** for local storage ✅
- Exports to JSON ✅
- **automated Proto-gen**: using my [protoc-helper repo](https://github.com/ji-podhead/protoc-helper) ✅
- creadted a  **CLI** using commander ✅
- changed codeBase and **removed redundant recoursion**  using hashlookuptables and relations ✅
- Fast Saving and Loading using **Service Worker as  Middleware** that keeps the process alive ✅
- added the **Api Server** ✅
- added a bun react **Dashboard** ✅
  
##                      Comming up
- Set up **File Watcher** to monitor your proto files for any changes. => Rescan and update the Componentregistry 🚧 
- create **VC CODE EXTENSION** to manage the api in vs code  🚧  
- sync with **external DB** 🚧 
- create demo **Dashboard** 🚧 
- add **tests** to Dashboard and a gRPC debug-Server 🚧 

