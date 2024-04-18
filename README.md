# protobuffctl  [![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)
![NPM Downloads](https://img.shields.io/npm/dw/protobuffctl)


- `protobuffctl` offers an  [API](https://ji-podhead.github.io/protobuffctl/) that enables you to automate all protobuf functions.
- Quickly create new message types, fields, services,  methods and enums using the [API](https://ji-podhead.github.io/protobuffctl/) and **cli commands**.<br>
- Automatically generates the corresponding protobuf files when making changes to the protofiles.<br>
- comes with Api-Server and Dashboard for demo- and debugging purposes.
- Stores all Components in the local **Componentregistry**. <br> or push/pull from external DB.
- The middleware will provide acid and prevents race conditions.
- **Roll back** to old protofile, or to an registry state using historical `.config` file, or using a external DB just like with **version control**.<br>
- **Preview** the Protofile-Code before actually building it.<br>
- Create your own **User Interface** and manage `Protocollbuffers` using the [API](https://ji-podhead.github.io/protobuffctl/) and input events.<br>
- Avoids recoursion when creating components *see ER Model below.
- **Export any Component to JSON**, or sync with **other registries** like gitey, or PostgreSQL
---
# Getting Started
**Install:**
 
```JavaScript
npm i protobuffctl
```
**Docs:**  [API](https://ji-podhead.github.io/protobuffctl/docs) <br>
**CLI Guide:** [in docs folder](https://ji-podhead.github.io/protobuffctl/docs/CLI-guide.md) 
 
---
##           >> PROTOBUFFCTL ER MODEL <<       
```                                                                                          
                                    ┌─────────────┐                          
               ┌──────────┐         │             │                          
   ┌───────────►ProtoFiles├─────────►             │                          
   │           └─▲──▲─────┘         │             │                          
   │             │  │               │             │                          
   │             │  │               │             │                          
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
  │                                 │             │                          
  └─────────────────────────────────►             │                          
                                    └─────────────┘                          
```
## Architecture
```              
              📊                        📚                         
┌──────────────┐ ┌──────────────────────┐  
│  Dashboard   │ │                      │                                                    
└──────▲───────┘ │  external Database   │                                                   
       │         │                      │
       |         └──────────▲───────────┘                                                                    |                                              
       │      🌐            |       🔄                 💻                                    
  ┌────▼───────┐    ┌───────▼───────┐    ┌─────────────┐                                    
  │            │    │               │    │             │                                     
  │ Api Server ◄────►  Api Wrapper  ◄────┤     CLI     │                                    
  │            │    │               │    │             │                                    
  └────────────┘    └───────▲───────┘    └─────────────┘                                    
                            │                                                               
                    ┌───────▼────────┐ 👷                                                      
                    │                │                                                      
                    │ Service-Worker │                                                      
                    │                │                                                      
                    └───────▲────────┘                                                      
                            │                                                               
          ┌─────────────────▼───────────────────┐ 🗄️                                           
          │                                     │                                           
          │   Protobuffctl - ComponentRegistry  │                                           
          │                                     │                                           
          └─────────────────────────────────────┘
```





---
### Update
- **Export to JSON**: All components are stored and can be reproduced. [See example JSON](https://github.com/ji-podhead/protobuffctl/blob/main/protobuffctl.json).
- **automated Proto-gen**:  Related protobuf files will automatically get compiled to their target folders using the [protoc-helper repo](https://github.com/ji-podhead/protoc-helper).
- **Fast Saving and Loading**: middleware keeps the process alive.
- **Protobuff Registry**: Protobuff registry and creation are working fine.
## Comming up
- 🚧 Set up **File Watcher** to monitor your proto files for any changes. => Rescan and update the Componentregistry.<br>
- 🚧 Get complete visual feedback for all related methods, components, and files directly with our **VC CODE EXTENSION**.<br> 
- sync with **external DB**
- create demo **Dashboard**


