 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [FlowChart](https://ji-podhead.github.io/protobuffctl/charts) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |

 [![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)
![NPM Downloads](https://img.shields.io/npm/dw/protobuffctl) <p align="center">
  <img src="https://github.com/ji-podhead/protobuffctl/blob/main/docs/protobuffctl.png?raw=true" width="150"  />
</p>

 
## FLow Chart
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
