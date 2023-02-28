#!/usr/bin/env node
const /*util =*/ { promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const fs = require("node:fs/promises");
const path = require("node:path");

// elm doesn't accept windows-style paths, so path.join does not work here
// const elmPathJoin = path.join;
const elmPathJoin = (left, right) =>
    left.replace(/\/+$/g, "") + "/" + right.replace(/^\/+/g, "");

const BOILERPLATE = "module Main exposing (main)\n\nimport Interact\n\n-- imported code\n";

const MY_BASE_DIRECTORY = __dirname;
// TODO: quote
const COMPILED_SRC = elmPathJoin(MY_BASE_DIRECTORY, "compiled.js");
const MAIN_SRC = elmPathJoin(MY_BASE_DIRECTORY, "src/Main.elm");

// TODO: allow multiple instances of elm-line running at the same time?
// (use separate, explicitly temporary directories)
const cmd = `cd ${MY_BASE_DIRECTORY} && elm make --output ${COMPILED_SRC} ${MAIN_SRC}`;
const main = async function(args) {
    // TODO: filter out command line variables
    let [ filePath ] = args;

    if(!filePath) {
        console.error("Could not read file at", filePath);
        process.exit(2);
    }

    let content = await fs.readFile(filePath);
    content = BOILERPLATE + content;
    await fs.writeFile(MAIN_SRC, content);

    const { stderr } = await exec(cmd);
    if(stderr) {
        console.log(`Error while building: ${stderr}`);
        process.exit(1);
    }

    const { Elm } = require(COMPILED_SRC);
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
