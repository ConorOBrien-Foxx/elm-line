#!/usr/bin/env node
const /*util =*/ { promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const fs = require("node:fs/promises");

// elm doesn't accept windows-style paths, so path.join does not work here
// const path = require("node:path");
// const elmPathJoin = path.join;

const elmPathJoin = (left, right) =>
    left.replace(/\/+$/g, "") + "/" + right.replace(/^\/+/g, "");

const ELM_BOILERPLATE = "module Main exposing (main)\n\nimport Interact\n\n-- imported code\n";

// TODO: quote for directories with special characters
const MY_BASE_DIRECTORY = __dirname;
const COMPILED_SRC = elmPathJoin(MY_BASE_DIRECTORY, "compiled.js");
const MAIN_SRC = elmPathJoin(MY_BASE_DIRECTORY, "src/Main.elm");
// TODO: allow ability to supply these as CLI args
const ELM_COMPILE_FLAGS = "--optimize";

const showError = (message, ...args) => {
    if(args.length === 0) {
        console.error("[elm-line]", message);
    }
    else {
        console.error("[elm-line]", message + ":");
        console.group();
        console.error(...args);
        console.groupEnd();
    }
};

// TODO: allow multiple instances of elm-line running at the same time?
// (use separate, explicitly temporary directories)
const cmd = `cd ${MY_BASE_DIRECTORY} && elm make --output ${COMPILED_SRC} ${MAIN_SRC} ${ELM_COMPILE_FLAGS}`;
const main = async function(args) {
    // TODO: filter out command line variables
    let [ filePath ] = args;

    if(!filePath) {
        showError(`No file name given`);
        process.exit(2);
    }

    // TODO: error check this
    let content = await fs.readFile(filePath);
    content = ELM_BOILERPLATE + content;
    await fs.writeFile(MAIN_SRC, content);

    let stderr;
    try {
        // we only care about this command for its side effects
        // WARNING: potential side effect, debugging information will be
        // treated as fatal.
        // TODO: procure exit code to ensure process completed correctly?
        let data = await exec(cmd);
        stderr = data.stderr;
    }
    catch(exception) {
        stderr = exception.stderr;
    }
    if(stderr) {
        showError("Error while building", stderr);
        process.exit(1);
    }
    
    const { Elm } = require(COMPILED_SRC);
    const main = Elm.Main.init();

    // handle inputs
    const inputBuffer = [];
    let elmState = {
        evaluating: false,
    }
    // data path: this program -> elm program
    const addInput = (input) => {
        inputBuffer.push(input);
        if(!elmState.evaluating) {
            sendInputToElm();
        }
    };
    const sendInputToElm = () => {
        elmState.evaluating = true;
        let line = inputBuffer.shift();
        main.ports.get.send(line);
    };
    // data path: elm program -> this program
    const onElmData = (data) => {
        // forward the elm program's output
        console.log(data);
        writePromptHead();
        elmState.evaluating = false;
        if(inputBuffer.length > 0) {
            // continue parsing inputs
            sendInputToElm();
        }
    };
    main.ports.put.subscribe(onElmData);
    
    const readline = require('readline');

    const writePromptHead = () => {
        // stdin.isTTY seems to be unset when stdout.isTTY is unset
        // either behavior is acceptable for this function
        if(process.stdin.isTTY/* && process.stdout.isTTY*/) {
            process.stdout.write("> ");
        }
    };

    writePromptHead();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on("line", (line) => {
        // send the data line we received
        addInput(line);
    });

    // TODO: allow the Elm program to close STDIN?
    // TODO: signal to Elm that input has been closed?
    rl.once("close", () => {
        // end of input
    });
};

main(process.argv.slice(2));
