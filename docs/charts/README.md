 | [About](https://ji-podhead.github.io/protobuffctl/) | [API](https://ji-podhead.github.io/protobuffctl/API) | [CLI Guide](https://ji-podhead.github.io/protobuffctl/guides) | [FlowChart](https://ji-podhead.github.io/protobuffctl/charts) | [Git-Repo](https://github.com/ji-podhead/protobuffctl) |
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
