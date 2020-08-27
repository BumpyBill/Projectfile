#!/usr/bin/env node
"use strict";

import fs from "fs";
import { join } from "path";
import moo from "moo";

import util from "util";
const { exec } = require("child_process");

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
          return Array.from(
            moo
              .compile({
                WS: /[ \t]+/,
                comment: /\/\/.*?$/,
                keyword: ["CMD", "ENV", "CMD"],
                string: {
                  match: /"(?:\\["\\]|[^\n"\\])*"/,
                  value: (s: string) => s.slice(1, -1),
                },
                name: /\w+/,
              })
              .reset(x)
          ).filter((x: any) => x.type != "WS");
        })
        .filter((x) => x[0] != undefined);

      var line: any;
      var envs: any = {};
      for (line of tokens) {
        // CMD
        if (!!line[0] && line[0].type == "keyword" && line[0].text == "CMD") {
          if (!!line[1] && line[1].value) {
            await exec(
              line[1].value,
              {
                cwd: join(process.cwd(), dir),
                env: { ...envs, ...process.env },
              },
              (err: any, stdout: any, stderr: any) => {
                if (stderr) console.log(stderr);
                if (!!stdout[0]) console.log(stdout);
              }
            );
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
