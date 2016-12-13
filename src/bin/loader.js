#!/usr/bin/env node
'use strict';
import argv from 'yargs';
import Loader from './../lib/loader';
import fs from 'fs';
const usage = argv
  .usage('Usage: $0 --config [file]')
  .option('config', {
    type: 'string',
    describe: 'Path to the config file',
    defaultDescription: 'confetti.loader.json',
    requiresArg: true
  })
  .argv;
const Transform = require('stream').Transform;
const t = new Transform({
  writableObjectMode: true,

  transform(chunk, encoding, callback) {
    const loader = new Loader();
    loader.loadDeck(JSON.parse(chunk.toString()))
      .then(
        deckData => {
          this.push(JSON.stringify(deckData));
          callback();
        }
      )
      .catch(error => {
        console.error(error);
      });
  }
});
fs.createReadStream(usage.config)
  .pipe(t)
  .pipe(process.stdout);
