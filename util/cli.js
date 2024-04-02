const { Command } = require('commander');
const {getAll,get,create,toJson,addWatcher,removeWatcher, stopAll,startAll, findAllUsages, del, pull, add, push, remove} =require("../src/shared");
const { set } = require('../src/protoUtils');


    const cli = new Command();
cli
    .command('startAll')
    .description('Start all watchers')
    .action(() => { startAll() });
cli
    .command('stopAll')
    .description('Stop all watchers')
    .action(() => { stopAll() });
cli
    .command('create <type> <arg1> [arg2] [arg3]>')
    .description('Initializes a new Proto-object,enum,type,service or ProtobuffFile in the registry')
    .action((type, arg1, arg2, arg3) => { 
    create(type, arg1, arg2, arg3) 
    })
cli
    .command('del <type> <id> [remove]')
    .description('Deletes a component, you need to Pull afterwards')
    .action((type, id,remove) => { 
    del(type, id,remove) 
    })
cli
    .command('getAll  [type] [describe] [jsonOut]')
    .description('retrieves all Objects of acertain type from registry')
    .action((type,describe,jsonOut) => { getAll(type,describe,jsonOut) });
cli
    .command('toJson  <out> [id]')
    .description('save to your protobuffctl.json')
    .action((out,id) => { toJson(out,id) });
cli
    .command('set <type> <element_name> <values>')
    .description('sets/creates and object')
    .action((type,element_name, values) => {set(type,element_name, values) });
cli
    .command('get <type> <name> [depth]')
    .description('describes a certain object and gets all its childObjects')
    .action((type,name,depth) => {get(type,name,depth) });
cli
    .command('add <type> <source> <target> [pull]')
    .description('add a childObject to another object')
    .action((type,source,target,pull) => {add(type,source,target,pull) });

cli
    .command('findAllUsages <type> <name>')
    .description('finds the objects that uses another object')
    .action((type,name) => {findAllUsages(type,name) });
cli
    .command('generateProtobuff <proto_file> <language> <outputPath>')
    .description('generate a protobuff file. many languages supported')
    .action((proto_file, language,outputPath) => { generateProtobuff(proto_file, language,outputPath )});
cli
    .command('pull <protoFiles>')
    .description('creates/edits the protobuff-files and protoFiles')
    .action((protoFiles) => {
        // Convert args from an array to a list of arguments
        pull(protoFiles);
    });
cli
    .command('push <protoFiles>')
    .description('scanns the protoFiles and updates the registry')
    .action((protoFiles) => {
        // Convert args from an array to a list of arguments
        push(protoFiles);
    });
cli
    .command('remove <source> <target> [recoursive] [pull]')
    .description('removes a childObject from another object. set recoursive to remove its childComponents from the protoFiles as well')
    .action((source,target,pull) => {
        remove(source,target,pull) }
        );     
    cli.parse(process.argv);
    module.exports = {  cli }
