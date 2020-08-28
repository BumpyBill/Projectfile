#!/usr/bin/env node
"use strict";

import fs from "fs";
import { join } from "path";
import moo from "moo";

import { spawn } from "child_process";

const grammar = {
  WS: /[ \t]+/,
  comment: /\/\/.*?$/,
  keyword: ["CMD", "ENV", "RUN"],
  string: {
    match: /"(?:\\["\\]|[^\n"\\])*"/,
    value: (s: string) => s.slice(1, -1),
  },
  name: /\w+/,
};

const args = require("yargs").argv;
const dir = args["_"][0];

if (!dir) {
  console.log(`Projectfile v${require("../../package.json").version}`);
} else {
  fs.readFile(
    join(process.cwd(), dir, "Projectfile"),
    "utf8",
    async (err, data) => {
      if (err) throw err;

      const code = data.split("\r\n");

      const tokens = code
        .map((x) => {
          return Array.from(moo.compile(grammar).reset(x)).filter(
            (x: any) => x.type != "WS"
          );
        })
        .filter((x) => x[0] != undefined);

      var line: any;
      var envs: any = {};
      for (line of tokens) {
        line = line.filter((x: any) => x.type != "comment");
        // CMD
        if (!!line[0] && line[0].type == "keyword" && line[0].text == "CMD") {
          if (!!line[1] && line[1].value) {
            const cmd = spawn(
              line[1].value.split(/ +/)[0],
              line[1].value
                .split(/ +/)
                .slice(1, line[1].value.split(/ +/).length),
              {
                cwd: join(process.cwd(), dir),
                env: { ...envs, ...process.env },
                shell: true,
                detached: args.detached ? args.detached : false,
              }
            );
            cmd.stdout.on("data", (data) => {
              console.log(data.toString());
            });

            cmd.stderr.on("data", (data: Error) => {
              throw data.toString();
            });

            cmd.on("close", (code) => {
              console.log(`Child Process Exited With Code ${code}`);
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
    }
  );
}
