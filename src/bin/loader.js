#!/usr/bin/env node
'use strict';
import argv from 'yargs';
import Loader from './../lib/loader';
const usage = argv
  .usage('Usage: $0 --config [file]')
  .option('config', {
    type: 'string',
    describe: 'Path to the config file',
    defaultDescription: 'confetti.loader.json',
    requiresArg: true
  })
  .argv;
const fs = require('fs');
const stream = fs.createReadStream(usage.config);
let content = '';
stream.on('data', function(buf) {
  content += buf.toString();
});
stream.on('end', function() {
  const loaderConfig = JSON.parse(content);
  const loader = new Loader();
  loader.loadDeck(loaderConfig)
    .then(
      data => {
        process.stdout.write(JSON.stringify(data));
      }
    )
    .catch(error => {
      console.error(error);
    })
});