# protobuffctl
## Getting Started
> comming up/

## Documentation
Protobuffctl has a command-line interface (CLI) tool designed to manage components and watchers for a project,   possibly related to Protocol Buffers (protobuf). This documentation provides an overview of the available commands and their usage. <br>`The the export module functions do exactly the same`


**getAll**
---
```javascript
getAll("<type>", <describe>, <jsonOut>);
```
Retrieves all elements of a specified type from the registry.
- `type`: The type of elements to retrieve (e.g., "protoFiles", "services", "methods", etc.).
- `describe`: A boolean indicating whether to describe the elements in detail.
- `jsonOut`: A boolean indicating whether to output the results in JSON format.

**get**
---
```javascript
get("<type>", "<name>", <depth>);
```
Retrieves a specific component from the registry.
- `type`: The type of the component to retrieve.
- `name`: The name of the component to retrieve.
- `depth`: The depth of recursion for retrieving related components.


**toJson**
---
```javascript
toJson("<out>", "<id>");
```
Converts the registry to a JSON file.
- `out`: The output path for the JSON file.
- `id`: The ID of the component to include in the JSON file.

**remove**
---
```javascript
remove("<type>", "<name>", <values>, <pull>);
```
Removes a component from another component.
- `type`: The type of the component to remove.
- `name`: The name of the component to remove.
- `values`: The values associated with the component to remove.
- `pull`: A boolean indicating whether to pull the changes to the registry.


**findAllUsages**
---
```javascript
findAllUsages("<type>", "<name>");
```
Finds all usages of a specified component in the registry.
- `type`: The type of the component to find usages for.
- `name`: The name of the component to find usages for.


**add**
---
```javascript
add("<type>", "<source>", "<target>", <pull>);
```
Adds a component to another component.
- `type`: The type of the component to add.
- `source`: The name of the source component.
- `target`: The name of the target component.
- `pull`: A boolean indicating whether to pull the changes to the registry.


**del**
---
```javascript
del("<type>", "<id>", <remove_from_components>);
```
Deletes a component from the registry.
- `type`: The type of the component to delete.
- `id`: The ID of the component to delete.
- `remove_from_components`: A boolean indicating whether to remove the component from other components.


**protogenArr**
---
```javascript
protogenArr(<protofiles>);
```
Generates Protobuff files for an array of proto files.
- `protofiles`: An array of proto file names or IDs.

**pull**
---
```javascript
pull(<protoFiles>, <remove_missing>);
```
Updates the registry with changes from the specified proto files.


**push**
---
- `protoFiles`: An array of proto file names or IDs.
- `remove_missing`: A boolean indicating whether to remove missing components from the registry.
```javascript
push(<protoFiles>, <remove_missing>);
```
Updates the proto files with changes from the registry.
- `protoFiles`: An array of proto file names or IDs.
- `remove_missing`: A boolean indicating whether to remove missing components from the proto files.


**createFromConfig**
---
```javascript
createFromConfig(<protoFiles>);
```
Creates components from a configuration file.
- `protoFiles`: An array of proto file names or IDs.

**create**
---
```javascript
create("<type>", "<arg1>", "<arg2>", "<arg3>");
```
Initializes a new Proto-object or ProtobuffFile in the registry.

- `type`: The type of object to create (e.g., "proto", "protobuff").
- `arg1`: The first argument, which is the file name for "proto" type or the protoFile ID for "protobuff" type.
- `arg2`: The second argument, which is the file path for "proto" type or the language for "protobuff" type.
- `arg3`: The third argument, which is the output path for "protobuff" type.
- `arg4`: The fourth argument, which is not used in the current implementation.
