#!/usr/bin/env node
'use strict';

import argv from 'yargs';
import Loader from './../lib/loader';
import fs from 'fs';
import path from 'path';

const loader = new Loader();
const args = argv
  .usage('Usage: $0 --config [file]')
  .option('config', {
    type: 'string',
    describe: 'JSON/JavaScript options object or file',
    defaultDescription: 'confetti.loader.json',
    requiresArg: true
  })
  .argv;

const getConfig = input => {
  try {
    return require(path.resolve(input));
  } catch (e) {
    var str;
    try {
      str = fs.readFileSync(input, 'utf8');
    } catch (e) {
      str = input;
    }
    try {
      return JSON.parse(str);
    } catch (e) {
      return eval('(' + str + ')');
    }
  }
};

loader.loadDeck(getConfig(args.config))
  .then(
    deckData => {
      process.stdout.write(JSON.stringify(deckData));
    }
  )
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
