'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/react-server-dom-webpack-server.browser.production.js');
} else {
  s = require('./cjs/react-server-dom-webpack-server.browser.development.js');
}

if (s.prerender) {
  exports.prerender = s.prerender;
}
