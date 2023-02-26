// step 1: compile elm code

const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

const BOILERPLATE = [
    "module Main exposing (main)\n\nimport Interact\n\n-- header", "-- end header\n-- code",
    "-- end code\n-- footer",
    "-- end footer"
];

const assemble = (header, code, footer) => {
    return [
        BOILERPLATE[0],
        header,
        BOILERPLATE[1],
        code,
        BOILERPLATE[2],
        footer,
        BOILERPLATE[3],
    ].join("\n");
};

const cmd = "elm make --output compiled.js src/Main.elm";

const main = async function() {
    const { stdout, stderr } = await exec(cmd);
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

    rl.on("line", (line) => {
        main.ports.put.subscribe(
            function putCallback (data) {
                main.ports.put.unsubscribe(putCallback);
                console.log(data);
            }
        );
        main.ports.get.send(line);
    });

    rl.once("close", () => {
        // end of input
    });
};

main();
