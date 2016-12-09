require('babel-polyfill');
import path from 'path';
import * as utils from './utils';
/*
 The loader class aims to retrieve all data and settings from the config files.
 */
class Loader {
  /* Load deck settings */
  loadDeckConfig(path) {
    return new Promise((resolve, reject) => {
      utils.loadYaml2JSON(path)
        .then(data => {
          // https://github.com/geraintluff/tv4
          // TODO: check with external validator
          // TODO: add check on file structure
          // Check on properties on data object
          // reject if something is wrong
          // TODO: check if:
          // - the given data is an object
          // - the object has the property theme (otherwise take the default
          // one)
          // - the object
          resolve(data);
        })
        .catch(error => reject(error));
    });
  }

  /* Load slides */
  loadSlides(path) {
    return new Promise((resolve, reject) => {
      utils.loadYaml2JSON(path)
        .then(data => {
          // TODO: add check on file structure
          // Check on properties on data object
          // reject if something is wrong
          resolve(data.slides);
        })
        .catch(error => reject(error));
    });
  }

  /* Load theme config */
  loadThemeConfig(path) {
    return new Promise((resolve, reject) => {
      utils.loadYaml2JSON(path)
        .then(data => {
          // TODO: add check on file structure
          // Check on properties on data object
          // reject if something is wrong
          resolve(data.config);
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
      data.compilers = config.compilers
        ? config.compilers
        : {};
      // Load slide data
      data.slides = await this.loadSlides(config.paths.slides);
      // Base theme path
      themePath = path.join(config.paths.themes, `confetti-theme-${data.theme}`);
      // Set paths: sources and destinations
      data.paths = {};
      // Set theme source paths
      data.paths.sources = {
        languages: path.join(themePath, 'languages'),
        index: path.join(themePath, 'views', 'index.pug'),
        slide: path.join(themePath, 'views', 'slide.pug'),
        views: path.join(themePath, 'views'),
        styles: path.join(themePath, 'styles'),
        fonts: path.join(themePath, 'fonts'),
        images: path.join(themePath, 'images')
      };
      // Set destinations paths
      data.paths.destinations = {
        views: config.paths.dist,
        index: config.paths.dist,
        slide: config.paths.dist,
        styles: path.join(config.paths.dist, 'styles'),
        fonts: path.join(config.paths.dist, 'fonts'),
        images: path.join(config.paths.dist, 'images')
      };
      // Load theme configs
      data.themeConfig = await this.loadThemeConfig(
        path.join(themePath, 'data.yml')
      );
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