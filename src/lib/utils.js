'use strict';
const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');
/* Utility to load yaml file */
export const loadYaml2JSON = filePath => {
  if (typeof filePath !== 'string') {
    throw new Error('The parameter -path- must be a string.');
  }
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(yaml.parse(data));
    });
  });
};
/*  Utility to get the translations file path of a given language */
export const getPathTranslationFile = (themeLanguagesPath, langCode) => {
  // Get the yml translations file for the given language
  let pathFile = path.join(themeLanguagesPath, `${langCode}.yml`);
  try {
    // Try to open the file
    fs.accessSync(pathFile);
  } catch (error) {
    // if catch the error: 'No such file or directory'
    if (error.code === 'ENOENT') {
      try {
        pathFile = path.join(themeLanguagesPath, 'default.yml');
        fs.accessSync(pathFile);
      } catch (error) {
        throw error;
      }
    } else {
      throw error;
    }
  }
  return pathFile;
};
