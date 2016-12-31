'use strict';
const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');
/*
 Utility to load yaml file
 */
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
/*
 Utility to get the translations file path of a given language
 */
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
/*
 Support function to split a markdown.
 */
function splitMarkdownParser(array, pattern, limit) {
  let first = true;
  let file = '';
  const portions = [];
  let counter = 0;
  array.map(item => {
    if (item !== '') {
      if (item.indexOf(pattern) > -1) {
        if (!first) {
          if (typeof limit === 'undefined' || counter < limit) {
            portions[counter] = file.substring(0, file.lastIndexOf('\n'));
            file = '';
            counter++;
          }
        } else {
          first = false;
        }
      } else {
        file += `${item}\n`;
      }
    }
  });
  portions[counter] = file.substring(0, file.lastIndexOf('\n'));
  return portions;
}
/*
 Utility to split a markdown file by a given pattern
 */
export const splitMarkDown = (readPath, pattern, limit) => {
  let array;
  try {
    array = fs.readFileSync(readPath).toString().split('\n');
  }
  catch (err) {
    throw err;
  }
  return splitMarkdownParser(array, pattern, limit);
};
/*
 Utility to split a markdown test by a given pattern
 */
export const splitMarkDownFromString = (txt, pattern, limit) => {
  return splitMarkdownParser(txt.split('\n'), pattern, limit);
};
/*
 Utility to convert "property:value occurrences" in a obj
 */
export const convertPropertyString = (txt, propertyDivider) => {
  const obj = {};
  let dividerIndex,
      value,
      property;
  txt.split(propertyDivider).map(item => {
    // Using indexOf rathen than split(':') it can handles a title with
    // character ':' inside.
    dividerIndex = item.indexOf(':');
    if (dividerIndex > -1) {
      property = item.substring(0, dividerIndex);
      value = (item.substring(dividerIndex + 1, item.length)).trim();
      obj[property] = value;
    }
  });
  return obj;
};