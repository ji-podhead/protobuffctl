<img width ="100" align="right" object-fit="contain" src="https://github.com/ji-podhead/protobuffctl/blob/main/docs/protobuffctl.png?raw=true"/>  

**| [Docs ](https://ji-podhead.github.io/protobuffctl/)|[API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [FlowChart](https://ji-podhead.github.io/protobuffctl/charts) |** 
 
#  Protobuffctl 

 [![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)
 <p align="center">







- [Protobuffctl](https://github.com/ji-podhead/protobuffctl) offers an  [API](https://ji-podhead.github.io/protobuffctl/) that enables you to automate all protobuf functions.
- Manage `message types`, `fields`, `services`,  `methods` and `enums` by using **cli commands**, or **Api-Server**.
- **Automatically generates** the corresponding **protobuf files** when making changes to the protofiles.<br>
- Stores all Components in the **local Componentregistry**. <br>
- Sync with **other registries** like gitey, or PostgreSQL.
- **Roll back** by using local safe-file, or by using a external DB just like with **version control**.<br>
- **Preview** the Protofile-Code before actually building it and export any Component to **JSON**.
- Comes with **Dashboard** for demo, debugging and **testing**.
- **Monitoring** for individual `message types` and `services` using the dashboard and [D3](https://d3js.org/).
- The middleware will provide acid and **prevents race conditions**.
---
##                      Getting Started
**Install:**
 
```JavaScript
npm i protobuffctl
```
**Docs:**  [see docs](https://ji-podhead.github.io/protobuffctl/guides) <br>
**CLI Guide:** [see docs/guides](https://github.com/ji-podhead/protobuffctl/blob/main/docs/CLI-guide.md) 

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
- Set up **File Watcher** to monitor your proto files for any changes. 🚧 
- create **VC CODE EXTENSION** to manage the api in vs code  🚧  
- sync with **external DB** 🚧 
- finish  **Dashboard**  and use a web compiler for demo 🚧
- implement UUID hashing logic 🚧
- add **tests** to Dashboard and a gRPC debug-Server 🚧 
---

## Flow Chart 
```
Architecture:                                                                                                  
                  ┌───────────┐ ┌──────────────────────┐                 
                  │ Dashboard │ │  external Database   │                    
                  └─────▲─────┘ └──────────▲───────────┘                    
                        │                  │                                                     
                  ┌─────▼─────┐   ┌────────▼────────┐  ┌─────────────┐           
                  │ Api Server◄───►   Api Wrapper   ◄──►     CLI     │          
                  └───────────┘   └────────▲────────┘  └─────────────┘      
                                           │                                
                                  ┌────────▼─────────┐                                          
                                  │  Service-Worker  │                                          
                                  └────────▲─────────┘   
                                           │             ┌─────────────────┐ 
                                    ┌──────▼───────┐ ┌───► HashLookUpTable │           
                                    │              │ │   └─────────────────┘
                                    │ Protobuffctl ◄─┤                      
                                    │              │ │     ┌─────────────┐  
                                    └──────▲───────┘ └─────►  Relations  │                                           
ER-Model                                   │               └─────────────┘ 
                                     ┌─────▼───────┐         
                ┌──────────┐         │             │                        
    ┌───────────►ProtoFiles├─────────►             │                        
    │           └─▲──▲─────┘         │             │                                             
    │             │  │  ┌────────┐   │             │                        
    │             │  └──┤Services├───►             │                        
    │             │     └───▲────┘   │             │                                                            
    │             │     ┌───┴───┐    │             │                        
    │             │     │Methods├────►  Component  │                        
    │             │     └───▲───┘    │      -      │                                              
    │        ┌────┴┐        │        │  Registry   |                       
    │        │Types├────────┴────────►             │                        
    │        └▲───▲┘                 │             │                                               
    │   ┌─────┴┐  │                  │             │                        
    │   │Nested├──┼──────────────────►             │                        
    │   └──▲─▲─┘  │                  │             │                        
 ┌──┴──┐   │ │   ┌┴─────┐            │             │                        
 │Enums├───┘ └───┤Fields├────────────►             │                        
 └─┬───┘         └──────┘            │             │                                              
   └─────────────────────────────────►             │                        
                                     └─────────────┘                           
```





