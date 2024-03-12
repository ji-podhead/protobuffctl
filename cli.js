const { Command } = require('commander');
const { init, save, deserialize, generateProtobuff, createComponent, addWatcher, removeWatcher, stopAll, startAll } = require("./shared")
const cli = new Command();
cli
    // Ensure WatcherManager is instantiated before use
    .command('add <filePath>')
    .description('Add a watcher for the specified file path')
    .action(async (filePath) => { addWatcher(filePath); });
cli
    .command('remove <filePath>')
    .description('Remove the watcher for the specified file path')
    .action((filePath) => { removeWatcher(filePath) });
cli
    .command('startAll')
    .description('Start all watchers')
    .action(() => { startAll() });
cli
    .command('stopAll')
    .description('Stop all watchers')
    .action(() => { stopAll() });
cli
    .command('init')
    .description('initialize using your protobuffctl.json')
    .action(() => { init() });
cli
    .command('generateProtobuff  <language> <proto_path> <proto_file> <outputPath>')
    .description('generate a protobuff file. many languages supported')
    .action(() => { generateProtobuff(language, proto_path,proto_file, outputPath) });
cli
    .command('createComponent  <filePath>')
    .description('save to your protobuffctl.json')
    .action(() => { save(filePath) });
cli
    .command('createComponent <type> [args...]')
    .description('Create a component with the specified type and arguments')
    .action((type, args) => {
        // Convert args from an array to a list of arguments
        const componentArgs = args.split(',');
        createComponent(type, ...componentArgs);
    });
       
cli.parse(process.argv);
module.exports = { program: cli }