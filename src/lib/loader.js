if (!global._babelPolyfill) {
  require('babel-polyfill');
}
import path from 'path';
import * as utils from './utils';
import validator from 'tv4';
import settingsSchema from './schemes/settings';
import slidesSchema from './schemes/slides';
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
  async loadDeck(config) {
    // TODO: check on the config structure
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
      // Set theme source paths
      data.paths.sources = {
        languages: path.join(themePath, 'languages'),
        index: path.join(themePath, 'views', 'index.pug'),
        slide: path.join(themePath, 'views', 'slide.pug'),
        views: path.join(themePath, 'views', '**', '*.pug'),
        styles: path.join(themePath, 'assets', 'styles', '**', '*.scss'),
        fonts: path.join(themePath, 'assets', 'fonts', '**', '*.{eot,ttf,otf,woff,svg}'),
        images: path.join(themePath, 'assets', 'images', '**', '*.{svg,png,jpg,jpeg,gif}'),
        javascript: path.join(themePath, 'assets', 'images', '**', '*.js')
      };
      // Set destinations paths
      data.paths.destinations = {
        views: config.paths.dist,
        index: config.paths.dist,
        slide: config.paths.dist,
        styles: path.join(config.paths.dist, 'styles'),
        fonts: path.join(config.paths.dist, 'fonts'),
        images: path.join(config.paths.dist, 'images'),
        javascript: path.join(config.paths.dist, 'javascript')
      };
      data.pathTo = {
        styles: '/styles/',
        javascript: '/javascript/',
        images: '/images/'
      };
      // Load theme configs
      data.themeConfig = await this.loadThemeConfig(path.join(themePath, 'data.yml'));
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