# protobuffctl 
- watches for filechanges in your proto files.
- automatically generates protobuff files for all your backends and languages
- automatically generate demo code for your services and messeages
-  Protobuffs for many available languages are getting created using my <a href="https://github.com/ji-podhead/protoc-helper">protoc-helper repo</a>. it uses  compiled protoc binary with javascript
  
# Protobuffctl CLI Documentation
Protobuffctl has a command-line interface (CLI) tool designed to manage components and watchers for a project,   possibly related to Protocol Buffers (protobuf). This documentation provides an overview of the available commands and their usage. `The the export module functions do exactly the same`
## Commands
### add 
> **Description:** Adds a watcher for the specified file path.

**Parameters:**
- `filePath`: The path to the file you want to watch.
```javascript
 node main.js add /path/to/your/file
 ````
---
### remove 
> **Description:** Removes the watcher for the specified file path.

**Parameters:**
- `filePath`: The path to the file you want to stop watching.
```javascript
 node main.js remove /path/to/your/file
 ````
---
### startAll
> **Description:** Starts all watchers.
```javascript
 node main.js startAll
 ````
---
### stopAll
> **Description:** Stops all watchers.
```javascript
 node main.js stopAll
 ````
---
### init
> **Description:** Initializes the tool using your protobuffctl.json configuration file.
```javascript
 node main.js init
 ````
---
### generateProtobuff 
> **Description:** Generates a protobuf file in the specified language.

**Parameters:**
- `language`: The language for which the protobuf file should be generated.
- `proto_path`: The path to the directory containing the protobuf files.
- `proto_file`: The path to the specific protobuf file to generate.
- `outputPath`: The path to the directory where the generated file should be saved.
```javascript
 node main.js generateProtobuff java /path/to/proto/files /path/to/proto/file.proto /path/to/output
 ````
---
### createComponent
**Description:** Creates a component with the specified type and arguments.

**Parameters:**
- `type`: The type of the component to create.
- `args...`: A variable number of arguments to pass to the component creation function. Arguments should be comma-separated.
```javascript
 node main.js createComponent yourComponentType arg1,arg2,arg3
 ````
```
//    |-- Database_Schema//    |       |
//    |       |-- ProtoFile
//    |       |   |-- Name
//    |       |   |-- Index
//    |       |   |-- ProtoFilePath
//    |       |   |-- Message
//    |       |   |   |-- Content
//    |       |   |   |-- Lang
//    |       |   |   |-- Parent
//    |       |   |
//    |       |   |-- Enum
//    |       |   |   |-- Content
//    |       |   |   |-- Lang
//    |       |   |   |-- Parent
//    |       |
//    |       |-- Endpoint 
//    |       |   |-- Name
//    |       |   |-- Index
//    |       |   |-- EndpointPath
//    |       |   |-- Protofiles
//    |       |   |-- ProtobuffFiles
//    |       |       |-- ProtoFilePath
//    |       |       |-- ProtobuffFilePath
//    |       |       |-- Clients
//    |       |       |-- Requests
//    |       |       |-- Callbacks
//    |       |       |-- Streams
//    |       |
//    |       |-- ProtobuffUser
//    |       |   |
//    |       |   |-- ProtobuffUserPath
//    |       |   |-- ProtobuffUserComponent
//    |       |        |-- type
//    |       |        |-- parent
//    |       |        |-- line
//    |       |        |-- content
//    |       |
//    |       |-- ProtobuffUserComponentPreset
//    |       |    |
//    |       |    |-- type
//    |       |    |-- lang
//    |       |    |-- preset const 
```
