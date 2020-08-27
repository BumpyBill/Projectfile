#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const moo_1 = __importDefault(require("moo"));
const { exec } = require("child_process");
const args = require("yargs").argv;
const dir = args["_"][0];
if (!dir) {
    console.log(`Projectfile v${require("../../package.json").version}`);
}
else {
    fs_1.default.readFile(path_1.join(process.cwd(), dir, "Projectfile"), "utf8", async (err, data) => {
        if (err)
            throw err;
        const code = data.split("\r\n");
        const tokens = code
            .map((x) => {
            return Array.from(moo_1.default
                .compile({
                WS: /[ \t]+/,
                comment: /\/\/.*?$/,
                keyword: ["CMD", "ENV", "CMD"],
                string: {
                    match: /"(?:\\["\\]|[^\n"\\])*"/,
                    value: (s) => s.slice(1, -1),
                },
                name: /\w+/,
            })
                .reset(x)).filter((x) => x.type != "WS");
        })
            .filter((x) => x[0] != undefined);
        var line;
        var envs = {};
        for (line of tokens) {
            // CMD
            if (!!line[0] && line[0].type == "keyword" && line[0].text == "CMD") {
                if (!!line[1] && line[1].value) {
                    await exec(line[1].value, {
                        cwd: path_1.join(process.cwd(), dir),
                        env: { ...process.env, ...envs },
                    }, (err, stdout, stderr) => {
                        if (stderr)
                            console.log(stderr);
                        if (!!stdout[0])
                            console.log(stdout);
                    });
                }
            }
            // ENV
            if (line[0].type == "keyword" && line[0].text == "ENV") {
                if (!!line[1] && line[1].type == "name") {
                    if (!!line[2]) {
                        envs[line[1]] = line[2].value;
                    }
                }
            }
        }
        console.log({ ...process.env, ...envs });
    });
}
