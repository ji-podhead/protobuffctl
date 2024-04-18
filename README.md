# protobuffctl [![npm version](https://img.shields.io/badge/alpha-green)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://img.shields.io/badge/protoc_v26.0-binary-blue)](https://www.npmjs.com/package/protobuffctl)
[![npm version](https://badge.fury.io/js/protobuffctl.svg)](https://badge.fury.io/js/protobuffctl)
![NPM Downloads](https://img.shields.io/npm/dw/protobuffctl)


- `protobuffctl` offers an  [API](https://ji-podhead.github.io/protobuffctl/) that enables you to automate all protobuf functions.
- It stores all Components in the **Componentregistry**. <br> 
- Quickly create new message types, fields, services,  methods and enums using the [API](https://ji-podhead.github.io/protobuffctl/) and **cli commands**.<br>
- Automatically generates the corresponding protobuf files when making changes to the protofiles.<br>
- **Roll back** to old protofile, or to an registry state using historical `.config` file just like with **version control**.<br>
- **Preview** the Protofile-Code before actually building it.<br>
- Create your own **User Interface** and manage `Protocollbuffers` using the [API](https://ji-podhead.github.io/protobuffctl/) and input events.<br>
- Avoids recoursion when creating components *see ER Model below.
- **Export any Component to JSON**, or sync with **other registries** like gitey, or PostgreSQL
---
# Getting Started

**Docs:**  [API](https://ji-podhead.github.io/protobuffctl/) 

 **Install:**
 
```JavaScript
npm i protobuffctl
```
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
## CLI Guide
**install globally**
```JavaScript
>> npm i -g protobuffctl
``` 
**Check out the commands and their args:**
```
>> protobuffctl 
```
=>
```
...
Usage: protobuffctl [options] [command]

Options:
  -h, --help                                              display help for command

Commands:
  startAll                                                Start all watchers
  stopAll                                                 Stop all watchers
  create <type> <arg1> [arg2] [arg3]]                     Initializes a new Proto-object,enum,type,service or ProtobuffFile in the registry
  del <type> <id>                                         Deletes a component, you need to Pull afterwards

...
```
**create a base proto file**
```JavaScript
>> protobuffctl create proto test.proto ./
```
this will create a `test.proto` in your current directory and output:
```
...
----------- created proto content -----------
syntax="proto3";
option java_multiple_files = true;
option java_package = "./";
option java_outer_classname = "test";
option objc_class_prefix = "HLW";
option go_package = "./";

package test;
``` 
**add a Type to your Proto:**
```
>> protobuffctl create type HelloRequest
```
Since we did not pass any fields, the output will look like this:
```
...
creating HelloRequest
successfully set types HelloRequest
 []
```
**check if it was successfully created:**
```
>> protobuffctl getAll types
```
without the describe flag at the end, it will output something like this:
```
...
[ 'HelloRequest']

```
**create a field:**
```
 >> protobuffctl create field message string 
```
=>

```
...
successfully set fields message
{ message: { type: 'string', id: -1 } }

```
**create another Type and add our Field to HelloRequest:**
```
>> protobuffctl create type HelloReply message
```
=>
```
...
fields
[ 'message' ]
creating HelloReply
successfully set types HelloReply
```
...adding it to HelloRequest:
``` 
>> protobuffctl add field message HelloRequest
```
**create a Method:**
```
>> protobuffctl create method SayHello HelloRequest HelloReply 

```
=> 
```
... 
{
  SayHello: { requestType: 'HelloRequest', responseType: 'HelloReply' }
}
successfully set methods SayHello
 {"SayHello":{"requestType":"HelloRequest","responseType":"HelloReply"}}

```
**create  Service using our Method:**
```
>> protobuffctl create service Greeter SayHello
```
=>
```
"methods"
[ 'SayHello' ]
creating Greeter
successfully set services Greeter
 ["SayHello"]

```
**printing all components using GetAll:**
```
>> protobuffctl getAll
...
Map(10) {
  'test_op' => 'options',
  'test' => 'protoFiles',
  'HelloRequest' => 'types',
  'string' => 'fields',
  'message' => 'fields',
  'HelloReply' => 'types',
  'SayHello' => 'methods',
  'Greeter' => 'services'
}
```
**Creating a Protobuff File and Object:**
```
>> protobuffctl create protobuff test ts /your/output_path
```
this should output something like this if it compiled successfully:
```
successuflly created protobuff file 🤑🤑🤑 
__________
finished command: ["ts","/your/output_path","test.proto","./",null]
```
if so you find a `test.ts` file in /your/output_path.
however, since we did not pull changes to the protoFile, we need to update it first.
and the output of the protoFile will look like this:
```
/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 3.20.3
 * source: test.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
export namespace test { }
```
**Pull to update the .proto File**
```

```



---

---

## Comming up
- 🚧 Set up **File Watcher** to monitor your proto files for any changes. => Rescan and update the Componentregistry.<br>
- 🚧 Get complete visual feedback for all related methods, components, and files directly with our **VC CODE EXTENSION**.<br> 




### Update
- **Fast Saving and Loading**: Added a daemon to keep the main object alive, including the registry.
- **Protobuff Registry**: Protobuff registry and creation are working fine.
- **Export to JSON**: All components are stored and can be reproduced. [See example JSON](https://github.com/ji-podhead/protobuffctl/blob/main/protobuffctl.json).
- **New Services, Types, Enums**: Create new services, types, enums via CLI command by copying from the registry or via command. 
- **automated Proto-gen**:  Related protobuf files will automatically get compiled to their target folders using the [protoc-helper repo](https://github.com/ji-podhead/protoc-helper).
- this thing works, which is nice. complete api to edit your protobuff  projects and files. you can set every important value via cli know and ill add support to get all protofiles from certain folders.
- you can apply changes via api know -> registry is getting updated -> protofiles are getting updates -> *protobuff-files are getting upddated* <- i actually need to implement that :)  but my db was created as a wrapper for protobuffjs, so i just need a bridge/method
### TODO
> **files and object cant be redundant**, however if failures arise due to the user, or missing drives, the config/save-file can get damaged which can lead to weird behaviour when automated processes are using the faulty objects, so i decided to add a health-state field for each object. **unhealthy files will be ignored and not further be processed**, but also the main statehandler wont delete that file, if it may become usuable again later.
- **Health State Field**: Add a health-state field for each object to handle failures and misconfigurations.
- **Health Check**: Add a health check to ensure the integrity of the objects.
- ~~**Merge Function**: Add a merge function for the user to copy fields back over to a healthy file if there were misconfigurations.~~


