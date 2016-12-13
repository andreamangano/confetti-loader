#!/usr/bin/env node
'use strict';
import argv from 'yargs';
import Loader from './../lib/loader';
const stream = require('stream');
const usage = argv
  .usage('Usage: $0 --config [file]')
  .option('config', {
    type: 'string',
    describe: 'Path to the config file',
    defaultDescription: 'confetti.loader.json',
    requiresArg: true
  })
  .argv;
const streamRead = fs.createReadStream(usage.config);
var converter = new stream.Transform();
converter._transform = function(data, encoding, cb) {
  const loader = new Loader();
  loader.loadDeck(JSON.parse(data.toString()))
    .then(
      deckData => {
        this.push(JSON.stringify(deckData));
        cb();
      }
    )
    .catch(error => {
      console.error(error);
    });
};
streamRead
  .pipe(converter)
  .pipe(process.stdout);

