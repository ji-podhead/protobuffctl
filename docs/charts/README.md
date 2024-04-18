
 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [FlowChart](https://ji-podhead.github.io/protobuffctl/charts) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |
 
## FLow Chart <img width ="100" align="right" object-fit="contain" src="https://github.com/ji-podhead/protobuffctl/blob/main/docs/protobuffctl.png?raw=true">

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
