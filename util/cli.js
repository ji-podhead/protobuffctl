const { Command } = require('commander');
const { set } = require('../src/protoUtils');
const axios = require('axios');
const url = 'http://localhost:3000/protobuffctl';
function apiCall(command,args){
const data = {
 command: command, // Zum Beispiel, ersetzen Sie dies durch den Befehl, den Sie ausführen möchten
 args: args // Die Argumente für den Befehl, falls erforderlich
};
axios.post(url, data)
 .then(response => {
    console.log('Erfolg:', response.data);
 })
 .catch(error => {
    console.error('Fehler:', error);
 });
}
    const cli = new Command();
cli
    .command('startServer')
    .description('Starts the api Server')
    .action(() => { apiCall("startServer",[]) });
cli
    .command('stopServer')
    .description('Stops the api server')
    .action(() => { apiCall("stopServer",[]) });

cli
    .command('create <type> <arg1> [arg2] [arg3]>')
    .description('Initializes a new Proto-object,enum,type,service or ProtobuffFile in the registry')
    .action((type, arg1, arg2, arg3) => { 
    apiCall("create", [type, arg1, arg2, arg3]) 
    })
cli
    .command('del <type> <id> [remove]')
    .description('Deletes a component, you need to Pull afterwards')
    .action((type, id,remove) => { 
    apiCall("del",[type, id,remove]) 
    })
cli
    .command('getAll  [type] [describe] [jsonOut]')
    .description('retrieves all Objects of acertain type from registry')
    .action((type,describe,jsonOut) => { apiCall("getAll",[type,describe,jsonOut]) });
cli
    .command('toJson  <out> [id]')
    .description('save to your protobuffctl.json')
    .action((out,id) => { apiCall("toJson",[out,id]) });
cli
    .command('set <type> <element_name> <values>')
    .description('sets/creates and object')
    .action((type,element_name, values) => {apiCall("set",[type,element_name, values]) });
cli
    .command('get <type> <name> [depth]')
    .description('describes a certain object and gets all its childObjects')
    .action((type,name,depth) => {apiCall("get",[type,name,depth]) });
cli
    .command('add <type> <source> <target> [pull]')
    .description('add a childObject to another object')
    .action((type,source,target,pull) => {apiCall("add",[type,source,target,pull]) });

cli
    .command('findAllUsages <type> <name>')
    .description('finds the objects that uses another object')
    .action((type,name) => {apiCall("findAllUsages",[type,name]) });
cli
    .command('generateProtobuff <proto_file> <language> <outputPath>')
    .description('generate a protobuff file. many languages supported')
    .action((proto_file, language,outputPath) => { apiCall("generateProtobuff",[proto_file, language,outputPath] )});
cli
    .command('pull <protoFiles>')
    .description('creates/edits the protobuff-files and protoFiles')
    .action((protoFiles) => {
        // Convert args from an array to a list of arguments
        apiCall("pull",[protoFiles]);
    });
cli
    .command('push <protoFiles>')
    .description('scanns the protoFiles and updates the registry')
    .action((protoFiles) => {
        // Convert args from an array to a list of arguments
        apiCall(push,protoFiles);
    });
cli
    .command('remove <source> <target> [recoursive] [pull]')
    .description('removes a childObject from another object. set recoursive to remove its childComponents from the protoFiles as well')
    .action((source,target,pull) => {
        apiCall(remove,source,target,pull) }
        );     
    cli.parse(process.argv);
    module.exports = {  cli }
