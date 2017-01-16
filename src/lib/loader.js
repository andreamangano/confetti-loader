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
   Load all data for creating the slide deck.
   */
  async loadDeck(config, isRelease) {
    let data;
    try {
      let themePath;
      let baseDestFolder;

      //-----------------------
      // Load basic deck config
      //-----------------------
      data = await this.loadDeckConfig(config.paths.settings);

      // Add compilers whether they are passed.
      data.compilers = config.compilers ? config.compilers : {};

      // Add release folder prefix
      data.release_prefix = data.release_prefix
        // It guarantees that the base url starts and ends with '/'
        ? path.join('/', data.release_prefix, '/')
        : '/';

      //----------------
      // Load slide data
      //----------------
      data.slides = await this.loadSlides(config.paths.slides);

      // Set paths: sources and destinations
      data.paths = {};

      // Base destination folder
      baseDestFolder = isRelease
        ? path.join(config.paths.dist, data.release_prefix)
        : path.join(config.paths.dev, data.release_prefix);

      // Base theme path
      themePath = path.join(config.paths.themes, data.theme);

      // Set sources
      // Get theme source paths
      data.paths.sources = this.getThemeSourcePaths(themePath);
      // Set user source paths
      data.paths.sources.deckImages = config.paths.covers;
      data.paths.sources.covers = path.join(config.paths.covers, 'covers');

      // Set destinations paths
      data.paths.destinations = this.getDestinationPaths(baseDestFolder);
      data.paths.to = this.getPathsTo();

      //-------------------
      // Load theme configs
      //-------------------
      const defaultThemeConfig = await this.loadThemeConfig(path.join(themePath, 'data.yml'));

      // Override user theme settings with default theme settings
      data.themeConfig = data.themeConfig
        ? _.merge(defaultThemeConfig, data.themeConfig)
        : defaultThemeConfig;

      // Include theme node_modules path
      data.compilers.sass.includePaths.push(path.join(themePath, 'node_modules'));

      //------------------
      // Load translations
      //------------------
      data.translations = await utils.loadYaml2JSON(
        utils.getPathTranslationFile(data.paths.sources.languages, data.lang)
      );
    } catch (err) {
      throw new Error(err);
    }
    return data;
  }

  getPathsTo() {
    return {
      styles: 'styles/',
      javascript: 'javascript/',
      images: 'images/',
      deckImages: 'deckImages/',
      covers: 'deckImages/covers/'
    }
  }

  getThemeSourcePaths(themePath) {
    return {
      languages: path.join(themePath, 'languages'),
      views: path.join(themePath, 'views'),
      styles: path.join(themePath, 'assets', 'styles'),
      fonts: path.join(themePath, 'assets', 'fonts'),
      images: path.join(themePath, 'assets', 'images'),
      javascript: path.join(themePath, 'assets', 'javascript')
    };
  }

  getDestinationPaths(root) {
    return {
      base: root,
      views: root,
      index: root,
      slide: root,
      styles: path.join(root, 'styles'),
      fonts: path.join(root, 'fonts'),
      images: path.join(root, 'images'),
      deckImages: path.join(root, 'deckImages'),
      covers: path.join(root, 'deckImages', 'covers'),
      javascript: path.join(root, 'javascript')
    };
  }
}
export default Loader;