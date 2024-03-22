const { Command } = require('commander');
const {getAll,get,create,toJson,addWatcher,removeWatcher, stopAll,startAll} =require("../src/shared");
const { set } = require('../src/protoUtils');

    
const cli = new Command();
//cli
//    // Ensure WatcherManager is instantiated before use
//    .command('add <filePath>')
//    .description('Add a watcher for the specified file path')
//    .action(async (filePath) => { addWatcher(filePath); });
//cli
//    .command('remove <filePath>')
//    .description('Remove the watcher for the specified file path')
//    .action((filePath) => { removeWatcher(filePath) });
cli
    .command('startAll')
    .description('Start all watchers')
    .action(() => { startAll() });
cli
    .command('stopAll')
    .description('Stop all watchers')
    .action(() => { stopAll() });
    cli
    .command('create <type> <arg1> <arg2> <arg3> <arg4>')
    .description('Initializes a new Proto-object or ProtobuffFile in the registry.\n Example for creating a ProtoFile \ncreate("proto", "example.proto", "/path/to/proto/files");\nExample for creating a ProtobuffFile\n"protobuff", "example.id", "ts", "/path/to/output"')
    .action((type, arg1, arg2, arg3, arg4) => { 
   //     if(type=="proto"){
   //     const parts = arg1.split('/');
   //      const path  = parts.slice(0, -1).join('/');
   //     const file = parts[parts.length - 1];
   //     create(type,file,path, arg2, arg3, arg4)     
   // }
   // else{
   //     
   // }
    create(type, arg1, arg2, arg3, arg4) 
    })
cli
    .command('getAll  <type> <describe> <jsonOut>')
    .description('save to your protobuffctl.json')
    .action((type,describe,jsonOut) => { getAll(type,describe,jsonOut) });
   cli
    .command('toJson  <out> <id>')
    .description('save to your protobuffctl.json')
    .action((out,id) => { toJson(out,id) });
    cli
    .command('set <type> <element_name> <values>')
    .description('save to your protobuffctl.json')
    .action((type,element_name, values) => {set(type,element_name, values) });
cli
    .command('get <type> <name> <depth>')
    .description('save to your protobuffctl.json')
    .action((type,name,depth) => {get(type,name,depth) });
cli
    .command('generateProtobuff <proto_file> <language> <outputPath>')
    .description('generate a protobuff file. many languages supported')
    .action((proto_file, language,outputPath) => { generateProtobuff(proto_file, language,outputPath )});
cli
    .command('createProtoComponent <type> [args...]')
    .description('Create a ProtoComponent with the specified type and arguments')
    .action((type, args) => {
        // Convert args from an array to a list of arguments
        const componentArgs = args.split(',');
        createProtoComponent(type, ...componentArgs);
    });
cli
    .command('regToJson')
    .description('Erstellt eine Konfigurationsdatei, falls noch nicht vorhanden')
    .action(() => {createConfig(); });

       
cli.parse(process.argv);
module.exports = {  cli }
