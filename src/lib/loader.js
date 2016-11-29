const path = require('path');
import * as utils from './utils';
/*
 The loader class aims to retrieve all data and settings from the config files.
 */
class Loader {
  constructor() {}
  /* Load deck settings */
  loadDeckConfig(path) {
    return utils.loadYaml2JSON(path);
  }
  /* Load slides */
  loadSlides(path) {
    return utils.loadYaml2JSON(path);
  }
  /* Load translations */
  loadTranslations(path, lang) {
    return utils.loadYaml2JSON(
      utils.getPathTranslationFile(path, lang)
    );
  }
  /* Load theme config */
  loadThemeConfig(path) {
    return utils.loadYaml2JSON(path);
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
    let themePath;
    // Load base deck settings
    const data = await this.loadDeckConfig(config.paths.settings);
    // Added compilers
    data.compilers = config.compilers;
    // Load slide data
    data.slides = await this.loadSlides(config.paths.slides);
    // Base theme path
    themePath = path.join(config.paths.themes, `confetti-theme-${data.theme}`);
    // Set paths: sources and destinations
    data.paths = {};
    // Set theme source paths
    data.paths.sources = {
      languages: path.join(themePath, 'languages'),
      views: path.join(themePath, 'views'),
      styles: path.join(themePath, 'styles'),
      fonts: path.join(themePath, 'fonts'),
      images: path.join(themePath, 'images')
    };
    // Set destinations paths
    data.paths.destinations = {
      views: config.paths.dist,
      styles: path.join(config.paths.dist, 'styles'),
      fonts: path.join(config.paths.dist, 'fonts'),
      images: path.join(config.paths.dist, 'images')
    };
    // Load theme configs
    data.themeConfig = await this.loadThemeConfig(
      path.join(themePath, 'data.yml')
    ).config;
    // Load translations
    data.translations = await this.loadTranslations(
      data.paths.sources.languages, data.lang
    );
    return data;
  }
}
export default Loader;