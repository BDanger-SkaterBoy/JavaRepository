module.exports=function(r,e){"use strict";var t={};function __webpack_require__(e){if(t[e]){return t[e].exports}var _=t[e]={i:e,l:false,exports:{}};r[e].call(_.exports,_,_.exports,__webpack_require__);_.l=true;return _.exports}__webpack_require__.ab=__dirname+"/";function startup(){return __webpack_require__(299)}return startup()}({299:function(r){"use strict";const e=/[|\\{}()[\]^$+*?.-]/g;r.exports=(r=>{if(typeof r!=="string"){throw new TypeError("Expected a string")}return r.replace(e,"\\$&")})}});