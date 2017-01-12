if (!global._babelPolyfill) {
  require('babel-polyfill');
}
import path from 'path';
import * as utils from './utils';
import validator from 'tv4';
import settingsSchema from './schemes/settings';
import slidesSchema from './schemes/slides';
import _ from 'lodash';
validator.addSchema('settings', settingsSchema);
validator.addSchema('slides', slidesSchema);
/*
 The loader class aims to retrieve all data and settings from the config files.
 */
class Loader {

  /* Load deck settings */
  loadDeckConfig(path) {
    return new Promise((resolve, reject) => {
      utils.loadYaml2JSON(path)
        .then(data => {
          if (!validator.validate(data, 'settings')) {
            reject(validator.error);
          }
          resolve(data);
        })
        .catch(error => reject(error));
    });
  }

  /* Load slides */
  loadSlides(path) {
    return new Promise((resolve, reject) => {
      const slides = [];
      /*
       Create an array where every item has the markdown string of a slide
       (header info included).
       */
      const splitSlides = utils.splitMarkDown(path, '[slide]');
      // Divide the content markdown from header info
      let temp;
      splitSlides.map((item, i) => {
        let info = {};
        temp = utils.splitMarkDownFromString(item, '---', 1);
        if (temp[0]) {
          // Parse header info e create a obj
          info = utils.convertPropertyString(temp[0], '\n');
        }
        if (temp[1]) {
          // Include description
          info.description = temp[1];
        }
        slides[i] = info;
      });
      if (!validator.validate(slides, 'slides')) {
        reject(validator.error)
      }
      resolve(slides);
    });
  }

  /* Load theme config */
  loadThemeConfig(path) {
    return new Promise((resolve, reject) => {
      utils.loadYaml2JSON(path)
        .then(data => {
          if (data.config) {
            resolve(data.config);
          }
          resolve({});
        })
        .catch(error => reject(error));
    });
  }

  /*
   Structure of config parameter:
   {
   paths: {
   settings: 'path/to/settings.yml',
   slides: 'path/to/slides.yml,
   themes: 'path/to/themes'
   },
   compilers: {
   sass: {...}
   }
   }
   */
  async loadDeck(config, isRelease) {
    let data = null;
    try {
      let themePath;
      // Load base deck settings
      data = await this.loadDeckConfig(config.paths.settings);
      // Added compilers
      data.compilers = config.compilers ? config.compilers : {};
      // Load slide data
      data.slides = await this.loadSlides(config.paths.slides);
      // Base theme path
      themePath = path.join(config.paths.themes, data.theme);
      // Set paths: sources and destinations
      data.paths = {};
      // Base destination folder
      const baseDestFolder = isRelease ? config.paths.dist : config.paths.dev;
      // Set theme source paths
      data.paths.sources = {
        languages: path.join(themePath, 'languages'),
        views: path.join(themePath, 'views'),
        styles: path.join(themePath, 'assets', 'styles'),
        fonts: path.join(themePath, 'assets', 'fonts'),
        images: path.join(themePath, 'assets', 'images'),
        deckImages: config.paths.covers,
        covers: path.join(config.paths.covers, 'covers'),
        javascript: path.join(themePath, 'assets', 'javascript')
      };
      // Set destinations paths
      data.paths.destinations = {
        views: baseDestFolder,
        index: baseDestFolder,
        slide: baseDestFolder,
        styles: path.join(baseDestFolder, 'styles'),
        fonts: path.join(baseDestFolder, 'fonts'),
        images: path.join(baseDestFolder, 'images'),
        deckImages: path.join(baseDestFolder, 'deckImages'),
        covers: path.join(baseDestFolder, 'deckImages', 'covers'),
        javascript: path.join(baseDestFolder, 'javascript')
      };
      data.paths.to = {
        styles: 'styles/',
        javascript: 'javascript/',
        images: 'images/',
        deckImages: 'deckImages/',
        covers: 'deckImages/covers/'
      };
      // Load theme configs
      const defaultThemeConfig = await this.loadThemeConfig(path.join(themePath, 'data.yml'));
      // Override user theme settings with default theme settings
      data.themeConfig = data.themeConfig
        ? _.merge(defaultThemeConfig, data.themeConfig)
        : defaultThemeConfig;
      // Include theme node_modules path
      data.compilers.sass.includePaths.push(path.join(themePath, 'node_modules'));
      // Load translations
      data.translations = await utils.loadYaml2JSON(
        utils.getPathTranslationFile(data.paths.sources.languages, data.lang)
      );
    } catch (err) {
      throw new Error(err);
    }
    return data;
  }
}
export default Loader;