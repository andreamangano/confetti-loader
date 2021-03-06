'use strict';
export default {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "Slide deck settings",
  "description": "A set of basic properties to configure your deck.",
  "properties": {
    "title": {
      "type": "string"
    },
    "author": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ]
    },
    "categories": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "theme": {
      "type": "string"
    }
  },
  "required": [
    "title",
    "author",
    "theme"
  ]
}