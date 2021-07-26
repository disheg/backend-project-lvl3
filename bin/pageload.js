#!/usr/bin/env node
import { program } from 'commander';
import pageLoad from '../index.js';

program
  .version('0.0.1')
  .option('--output')
  .arguments('<dirpath> <url>')
  .action((dirpath, url) => {
    pageLoad(dirpath, url);
  })
  .parse(process.argv);
