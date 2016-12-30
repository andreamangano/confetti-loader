'use strict';
export default {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Slides",
  "description": "Slides set",
  "type": "array",
  "items": {
    "title": "Slide",
    "type": "object",
    "properties": {
      "title": {
        "type": "string"
      },
      "picture": {
        "type": "string"
      },
      "description": {
        "type": "string"
      }
    },
    "required": [
      "title"
    ]
  }
}