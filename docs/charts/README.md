

 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [FlowChart](https://ji-podhead.github.io/protobuffctl/charts) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |

<p align="left">
  <img src="https://github.com/ji-podhead/protobuffctl/blob/main/docs/protobuffctl.png?raw=true" width="150"  />
</p>

[![npm version](https://img.shields.io/badge/🚧_under_construction_🚧-black)](https://www.npmjs.com/package/protobuffctl)
 
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
