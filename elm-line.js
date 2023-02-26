const util = { parseArgs, promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const fs = require("node:fs/promises");

const BOILERPLATE = 
    "module Main exposing (main)\n\nimport Interact\n\n-- header";

const cmd = "elm make --output compiled.js src/Main.elm";

const main = async function(args) {
    // TODO: filter out command line variables
    let [ filePath ] = args;

    if(!filePath) {
        console.error("Could not read file at", filePath);
        process.exit(2);
    }

    let content = await fs.readFile(filePath);
    content = BOILERPLATE + content;
    await fs.writeFile("src/Main.elm", content);

    const { stderr } = await exec(cmd);
    if(stderr) {
        console.log(`Error while building: ${stderr}`);
        process.exit(1);
    }

    const { Elm } = require("./compiled.js");
    const main = Elm.Main.init();
    
    const readline = require('readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    // TODO: add nice decorators for terminal mode
    rl.on("line", (line) => {
        main.ports.put.subscribe(
            function putCallback (data) {
                main.ports.put.unsubscribe(putCallback);
                console.log(data);
            }
        );
        main.ports.get.send(line);
    });

    // TODO: allow the Elm program to close STDIN?
    rl.once("close", () => {
        // end of input
    });
};

main(process.argv.slice(2));
