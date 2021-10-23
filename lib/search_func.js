"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var search_1 = require("./search");
function getMetadataFunc(viewService, dates, numbers, keys) {
  var m = { dates: dates, numbers: numbers };
  if (m.dates && m.dates.length > 0 || m.numbers && m.numbers.length > 0) {
    return m;
  }
  if (keys) {
    if (!Array.isArray(keys)) {
      return search_1.buildMetadata(keys);
    }
  }
  if (typeof viewService !== 'function' && viewService.metadata) {
    var metadata = viewService.metadata();
    if (metadata) {
      return search_1.buildMetadata(metadata);
    }
  }
  return undefined;
}
exports.getMetadataFunc = getMetadataFunc;
