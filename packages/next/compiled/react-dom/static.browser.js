/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 993:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

/**
 * @license React
 * react-dom-static.browser.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var React = __nccwpck_require__(533);
var ReactDOM = __nccwpck_require__(174);

var ReactVersion = '18.3.0-experimental-a8c16a004-20221012';

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

// by calls to these methods by a Babel plugin.
//
// In PROD (or in packages without access to React internals),
// they are left as they are instead.

function warn(format) {
  {
    {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      printWarning('warn', format, args);
    }
  }
}
function error(format) {
  {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var argsWithFormat = args.map(function (item) {
      return String(item);
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

function scheduleWork(callback) {
  callback();
}
var VIEW_SIZE = 512;
var currentView = null;
var writtenBytes = 0;
function beginWriting(destination) {
  currentView = new Uint8Array(VIEW_SIZE);
  writtenBytes = 0;
}
function writeChunk(destination, chunk) {
  if (chunk.length === 0) {
    return;
  }

  if (chunk.length > VIEW_SIZE) {
    // this chunk may overflow a single view which implies it was not
    // one that is cached by the streaming renderer. We will enqueu
    // it directly and expect it is not re-used
    if (writtenBytes > 0) {
      destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes));
      currentView = new Uint8Array(VIEW_SIZE);
      writtenBytes = 0;
    }

    destination.enqueue(chunk);
    return;
  }

  var bytesToWrite = chunk;
  var allowableBytes = currentView.length - writtenBytes;

  if (allowableBytes < bytesToWrite.length) {
    // this chunk would overflow the current view. We enqueue a full view
    // and start a new view with the remaining chunk
    if (allowableBytes === 0) {
      // the current view is already full, send it
      destination.enqueue(currentView);
    } else {
      // fill up the current view and apply the remaining chunk bytes
      // to a new view.
      currentView.set(bytesToWrite.subarray(0, allowableBytes), writtenBytes); // writtenBytes += allowableBytes; // this can be skipped because we are going to immediately reset the view

      destination.enqueue(currentView);
      bytesToWrite = bytesToWrite.subarray(allowableBytes);
    }

    currentView = new Uint8Array(VIEW_SIZE);
    writtenBytes = 0;
  }

  currentView.set(bytesToWrite, writtenBytes);
  writtenBytes += bytesToWrite.length;
}
function writeChunkAndReturn(destination, chunk) {
  writeChunk(destination, chunk); // in web streams there is no backpressure so we can alwas write more

  return true;
}
function completeWriting(destination) {
  if (currentView && writtenBytes > 0) {
    destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes));
    currentView = null;
    writtenBytes = 0;
  }
}
function close(destination) {
  destination.close();
}
var textEncoder = new TextEncoder();
function stringToChunk(content) {
  return textEncoder.encode(content);
}
function stringToPrecomputedChunk(content) {
  return textEncoder.encode(content);
}
function closeWithError(destination, error) {
  // $FlowFixMe[method-unbinding]
  if (typeof destination.error === 'function') {
    // $FlowFixMe: This is an Error object or the destination accepts other types.
    destination.error(error);
  } else {
    // Earlier implementations doesn't support this method. In that environment you're
    // supposed to throw from a promise returned but we don't return a promise in our
    // approach. We could fork this implementation but this is environment is an edge
    // case to begin with. It's even less common to run this in an older environment.
    // Even then, this is not where errors are supposed to happen and they get reported
    // to a global callback in addition to this anyway. So it's fine just to close this.
    destination.close();
  }
}

/*
 * The `'' + value` pattern (used in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */
// $FlowFixMe only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object'; // $FlowFixMe

    return type;
  }
} // $FlowFixMe only called in DEV, so void return is not possible.


function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}

function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}

function checkAttributeStringCoercion(value, attributeName) {
  {
    if (willCoercionThrow(value)) {
      error('The provided `%s` attribute is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', attributeName, typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}
function checkCSSPropertyStringCoercion(value, propName) {
  {
    if (willCoercionThrow(value)) {
      error('The provided `%s` CSS property is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', propName, typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}
function checkHtmlStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      error('The provided HTML markup uses a value of unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

// -----------------------------------------------------------------------------
var enableFloat = true; // When a node is unmounted, recurse into the Fiber subtree and clean out

// $FlowFixMe[method-unbinding]
var hasOwnProperty = Object.prototype.hasOwnProperty;

// A reserved attribute.
// It is handled by React separately and shouldn't be written to the DOM.
var RESERVED = 0; // A simple string attribute.
// Attributes that aren't in the filter are presumed to have this type.

var STRING = 1; // A string attribute that accepts booleans in React. In HTML, these are called
// "enumerated" attributes with "true" and "false" as possible values.
// When true, it should be set to a "true" string.
// When false, it should be set to a "false" string.

var BOOLEANISH_STRING = 2; // A real boolean attribute.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.

var BOOLEAN = 3; // An attribute that can be used as a flag as well as with a value.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.
// For any other value, should be present with that value.

var OVERLOADED_BOOLEAN = 4; // An attribute that must be numeric or parse as a numeric.
// When falsy, it should be removed.

var NUMERIC = 5; // An attribute that must be positive numeric or parse as a positive numeric.
// When falsy, it should be removed.

var POSITIVE_NUMERIC = 6;

/* eslint-disable max-len */
var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
/* eslint-enable max-len */

var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
var illegalAttributeNameCache = {};
var validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true;
  }

  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false;
  }

  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }

  illegalAttributeNameCache[attributeName] = true;

  {
    error('Invalid attribute name: `%s`', attributeName);
  }

  return false;
}
function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
  if (propertyInfo !== null && propertyInfo.type === RESERVED) {
    return false;
  }

  switch (typeof value) {
    case 'function':
    case 'symbol':
      // eslint-disable-line
      return true;

    case 'boolean':
      {
        if (isCustomComponentTag) {
          return false;
        }

        if (propertyInfo !== null) {
          return !propertyInfo.acceptsBooleans;
        } else {
          var prefix = name.toLowerCase().slice(0, 5);
          return prefix !== 'data-' && prefix !== 'aria-';
        }
      }

    default:
      return false;
  }
}
function getPropertyInfo(name) {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}

function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL, removeEmptyString) {
  this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
  this.attributeName = attributeName;
  this.attributeNamespace = attributeNamespace;
  this.mustUseProperty = mustUseProperty;
  this.propertyName = name;
  this.type = type;
  this.sanitizeURL = sanitizeURL;
  this.removeEmptyString = removeEmptyString;
} // When adding attributes to this list, be sure to also add them to
// the `possibleStandardNames` module to ensure casing and incorrect
// name warnings.


var properties = {}; // These props are reserved by React. They shouldn't be written to the DOM.

var reservedProps = ['children', 'dangerouslySetInnerHTML', // TODO: This prevents the assignment of defaultValue to regular
// elements (not just inputs). Now that ReactDOMInput assigns to the
// defaultValue property -- do we need this?
'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'];

{
  reservedProps.push('innerText', 'textContent');
}

reservedProps.forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, RESERVED, false, // mustUseProperty
  name, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // A few React string attributes have a different name.
// This is a mapping from React prop names to the attribute names.

[['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function (_ref) {
  var name = _ref[0],
      attributeName = _ref[1];
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are "enumerated" HTML attributes that accept "true" and "false".
// In React, we let users pass `true` and `false` even though technically
// these aren't boolean attributes (they are coerced to strings).

['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are "enumerated" SVG attributes that accept "true" and "false".
// In React, we let users pass `true` and `false` even though technically
// these aren't boolean attributes (they are coerced to strings).
// Since these are SVG attributes, their attribute names are case-sensitive.

['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
  name, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are HTML boolean attributes.

['allowFullScreen', 'async', // Note: there is a special case that prevents it from being written to the DOM
// on the client side because the browsers are inconsistent. Instead we call focus().
'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'disablePictureInPicture', 'disableRemotePlayback', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless', // Microdata
'itemScope'].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are the few React props that we set as DOM properties
// rather than attributes. These are all booleans.

['checked', // Note: `option.selected` is not updated if `select.multiple` is
// disabled with `removeAttribute`. We have special logic for handling this.
'multiple', 'muted', 'selected' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, // mustUseProperty
  name, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are HTML attributes that are "overloaded booleans": they behave like
// booleans, but can also accept a string value.

['capture', 'download' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, // mustUseProperty
  name, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are HTML attributes that must be positive numbers.

['cols', 'rows', 'size', 'span' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, // mustUseProperty
  name, // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These are HTML attributes that must be numbers.

['rowSpan', 'start'].forEach(function (name) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[name] = new PropertyInfoRecord(name, NUMERIC, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
});
var CAMELIZE = /[\-\:]([a-z])/g;

var capitalize = function (token) {
  return token[1].toUpperCase();
}; // This is a list of all SVG attributes that need special casing, namespacing,
// or boolean value assignment. Regular attributes that just accept strings
// and have the same names are omitted, just like in the HTML attribute filter.
// Some of these attributes can be hard to find. This list was created by
// scraping the MDN documentation.


['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize); // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions

  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // String SVG attributes with the xlink namespace.

['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize); // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions

  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, 'http://www.w3.org/1999/xlink', false, // sanitizeURL
  false);
}); // String SVG attributes with the xml namespace.

['xml:base', 'xml:lang', 'xml:space' // NOTE: if you add a camelCased prop to this list,
// you'll need to set attributeName to name.toLowerCase()
// instead in the assignment below.
].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize); // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions

  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, 'http://www.w3.org/XML/1998/namespace', false, // sanitizeURL
  false);
}); // These attribute exists both in HTML and SVG.
// The attribute name is case-sensitive in SVG so we can't just use
// the React name like we do for attributes that exist only in HTML.

['tabIndex', 'crossOrigin'].forEach(function (attributeName) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, // mustUseProperty
  attributeName.toLowerCase(), // attributeName
  null, // attributeNamespace
  false, // sanitizeURL
  false);
}); // These attributes accept URLs. These must not allow javascript: URLS.
// These will also need to accept Trusted Types object in the future.

var xlinkHref = 'xlinkHref'; // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions

properties[xlinkHref] = new PropertyInfoRecord('xlinkHref', STRING, false, // mustUseProperty
'xlink:href', 'http://www.w3.org/1999/xlink', true, // sanitizeURL
false);
['src', 'href', 'action', 'formAction'].forEach(function (attributeName) {
  // $FlowFixMe[invalid-constructor] Flow no longer supports calling new on functions
  properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, // mustUseProperty
  attributeName.toLowerCase(), // attributeName
  null, // attributeNamespace
  true, // sanitizeURL
  true);
});

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  animationIterationCount: true,
  aspectRatio: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};
/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */

function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}
/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */


var prefixes = ['Webkit', 'ms', 'Moz', 'O']; // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.

Object.keys(isUnitlessNumber).forEach(function (prop) {
  prefixes.forEach(function (prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

var hasReadOnlyValue = {
  button: true,
  checkbox: true,
  image: true,
  hidden: true,
  radio: true,
  reset: true,
  submit: true
};
function checkControlledValueProps(tagName, props) {
  {
    if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
      error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
    }

    if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
      error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
    }
  }
}

function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }

  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this list too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;

    default:
      return true;
  }
}

var ariaProperties = {
  'aria-current': 0,
  // state
  'aria-description': 0,
  'aria-details': 0,
  'aria-disabled': 0,
  // state
  'aria-hidden': 0,
  // state
  'aria-invalid': 0,
  // state
  'aria-keyshortcuts': 0,
  'aria-label': 0,
  'aria-roledescription': 0,
  // Widget Attributes
  'aria-autocomplete': 0,
  'aria-checked': 0,
  'aria-expanded': 0,
  'aria-haspopup': 0,
  'aria-level': 0,
  'aria-modal': 0,
  'aria-multiline': 0,
  'aria-multiselectable': 0,
  'aria-orientation': 0,
  'aria-placeholder': 0,
  'aria-pressed': 0,
  'aria-readonly': 0,
  'aria-required': 0,
  'aria-selected': 0,
  'aria-sort': 0,
  'aria-valuemax': 0,
  'aria-valuemin': 0,
  'aria-valuenow': 0,
  'aria-valuetext': 0,
  // Live Region Attributes
  'aria-atomic': 0,
  'aria-busy': 0,
  'aria-live': 0,
  'aria-relevant': 0,
  // Drag-and-Drop Attributes
  'aria-dropeffect': 0,
  'aria-grabbed': 0,
  // Relationship Attributes
  'aria-activedescendant': 0,
  'aria-colcount': 0,
  'aria-colindex': 0,
  'aria-colspan': 0,
  'aria-controls': 0,
  'aria-describedby': 0,
  'aria-errormessage': 0,
  'aria-flowto': 0,
  'aria-labelledby': 0,
  'aria-owns': 0,
  'aria-posinset': 0,
  'aria-rowcount': 0,
  'aria-rowindex': 0,
  'aria-rowspan': 0,
  'aria-setsize': 0
};

var warnedProperties = {};
var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

function validateProperty(tagName, name) {
  {
    if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
      return true;
    }

    if (rARIACamel.test(name)) {
      var ariaName = 'aria-' + name.slice(4).toLowerCase();
      var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null; // If this is an aria-* attribute, but is not listed in the known DOM
      // DOM properties, then it is an invalid aria-* attribute.

      if (correctName == null) {
        error('Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.', name);

        warnedProperties[name] = true;
        return true;
      } // aria-* attributes should be lowercase; suggest the lowercase version.


      if (name !== correctName) {
        error('Invalid ARIA attribute `%s`. Did you mean `%s`?', name, correctName);

        warnedProperties[name] = true;
        return true;
      }
    }

    if (rARIA.test(name)) {
      var lowerCasedName = name.toLowerCase();
      var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null; // If this is an aria-* attribute, but is not listed in the known DOM
      // DOM properties, then it is an invalid aria-* attribute.

      if (standardName == null) {
        warnedProperties[name] = true;
        return false;
      } // aria-* attributes should be lowercase; suggest the lowercase version.


      if (name !== standardName) {
        error('Unknown ARIA attribute `%s`. Did you mean `%s`?', name, standardName);

        warnedProperties[name] = true;
        return true;
      }
    }
  }

  return true;
}

function warnInvalidARIAProps(type, props) {
  {
    var invalidProps = [];

    for (var key in props) {
      var isValid = validateProperty(type, key);

      if (!isValid) {
        invalidProps.push(key);
      }
    }

    var unknownPropString = invalidProps.map(function (prop) {
      return '`' + prop + '`';
    }).join(', ');

    if (invalidProps.length === 1) {
      error('Invalid aria prop %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
    } else if (invalidProps.length > 1) {
      error('Invalid aria props %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
    }
  }
}

function validateProperties(type, props) {
  if (isCustomComponent(type, props)) {
    return;
  }

  warnInvalidARIAProps(type, props);
}

var didWarnValueNull = false;
function validateProperties$1(type, props) {
  {
    if (type !== 'input' && type !== 'textarea' && type !== 'select') {
      return;
    }

    if (props != null && props.value === null && !didWarnValueNull) {
      didWarnValueNull = true;

      if (type === 'select' && props.multiple) {
        error('`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.', type);
      } else {
        error('`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.', type);
      }
    }
  }
}

// When adding attributes to the HTML or SVG allowed attribute list, be sure to
// also add them to this module to ensure casing and incorrect name
// warnings.
var possibleStandardNames = {
  // HTML
  accept: 'accept',
  acceptcharset: 'acceptCharset',
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  action: 'action',
  allowfullscreen: 'allowFullScreen',
  alt: 'alt',
  as: 'as',
  async: 'async',
  autocapitalize: 'autoCapitalize',
  autocomplete: 'autoComplete',
  autocorrect: 'autoCorrect',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  autosave: 'autoSave',
  capture: 'capture',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  challenge: 'challenge',
  charset: 'charSet',
  checked: 'checked',
  children: 'children',
  cite: 'cite',
  class: 'className',
  classid: 'classID',
  classname: 'className',
  cols: 'cols',
  colspan: 'colSpan',
  content: 'content',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  controls: 'controls',
  controlslist: 'controlsList',
  coords: 'coords',
  crossorigin: 'crossOrigin',
  dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
  data: 'data',
  datetime: 'dateTime',
  default: 'default',
  defaultchecked: 'defaultChecked',
  defaultvalue: 'defaultValue',
  defer: 'defer',
  dir: 'dir',
  disabled: 'disabled',
  disablepictureinpicture: 'disablePictureInPicture',
  disableremoteplayback: 'disableRemotePlayback',
  download: 'download',
  draggable: 'draggable',
  enctype: 'encType',
  enterkeyhint: 'enterKeyHint',
  for: 'htmlFor',
  form: 'form',
  formmethod: 'formMethod',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  headers: 'headers',
  height: 'height',
  hidden: 'hidden',
  high: 'high',
  href: 'href',
  hreflang: 'hrefLang',
  htmlfor: 'htmlFor',
  httpequiv: 'httpEquiv',
  'http-equiv': 'httpEquiv',
  icon: 'icon',
  id: 'id',
  imagesizes: 'imageSizes',
  imagesrcset: 'imageSrcSet',
  innerhtml: 'innerHTML',
  inputmode: 'inputMode',
  integrity: 'integrity',
  is: 'is',
  itemid: 'itemID',
  itemprop: 'itemProp',
  itemref: 'itemRef',
  itemscope: 'itemScope',
  itemtype: 'itemType',
  keyparams: 'keyParams',
  keytype: 'keyType',
  kind: 'kind',
  label: 'label',
  lang: 'lang',
  list: 'list',
  loop: 'loop',
  low: 'low',
  manifest: 'manifest',
  marginwidth: 'marginWidth',
  marginheight: 'marginHeight',
  max: 'max',
  maxlength: 'maxLength',
  media: 'media',
  mediagroup: 'mediaGroup',
  method: 'method',
  min: 'min',
  minlength: 'minLength',
  multiple: 'multiple',
  muted: 'muted',
  name: 'name',
  nomodule: 'noModule',
  nonce: 'nonce',
  novalidate: 'noValidate',
  open: 'open',
  optimum: 'optimum',
  pattern: 'pattern',
  placeholder: 'placeholder',
  playsinline: 'playsInline',
  poster: 'poster',
  preload: 'preload',
  profile: 'profile',
  radiogroup: 'radioGroup',
  readonly: 'readOnly',
  referrerpolicy: 'referrerPolicy',
  rel: 'rel',
  required: 'required',
  reversed: 'reversed',
  role: 'role',
  rows: 'rows',
  rowspan: 'rowSpan',
  sandbox: 'sandbox',
  scope: 'scope',
  scoped: 'scoped',
  scrolling: 'scrolling',
  seamless: 'seamless',
  selected: 'selected',
  shape: 'shape',
  size: 'size',
  sizes: 'sizes',
  span: 'span',
  spellcheck: 'spellCheck',
  src: 'src',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  srcset: 'srcSet',
  start: 'start',
  step: 'step',
  style: 'style',
  summary: 'summary',
  tabindex: 'tabIndex',
  target: 'target',
  title: 'title',
  type: 'type',
  usemap: 'useMap',
  value: 'value',
  width: 'width',
  wmode: 'wmode',
  wrap: 'wrap',
  // SVG
  about: 'about',
  accentheight: 'accentHeight',
  'accent-height': 'accentHeight',
  accumulate: 'accumulate',
  additive: 'additive',
  alignmentbaseline: 'alignmentBaseline',
  'alignment-baseline': 'alignmentBaseline',
  allowreorder: 'allowReorder',
  alphabetic: 'alphabetic',
  amplitude: 'amplitude',
  arabicform: 'arabicForm',
  'arabic-form': 'arabicForm',
  ascent: 'ascent',
  attributename: 'attributeName',
  attributetype: 'attributeType',
  autoreverse: 'autoReverse',
  azimuth: 'azimuth',
  basefrequency: 'baseFrequency',
  baselineshift: 'baselineShift',
  'baseline-shift': 'baselineShift',
  baseprofile: 'baseProfile',
  bbox: 'bbox',
  begin: 'begin',
  bias: 'bias',
  by: 'by',
  calcmode: 'calcMode',
  capheight: 'capHeight',
  'cap-height': 'capHeight',
  clip: 'clip',
  clippath: 'clipPath',
  'clip-path': 'clipPath',
  clippathunits: 'clipPathUnits',
  cliprule: 'clipRule',
  'clip-rule': 'clipRule',
  color: 'color',
  colorinterpolation: 'colorInterpolation',
  'color-interpolation': 'colorInterpolation',
  colorinterpolationfilters: 'colorInterpolationFilters',
  'color-interpolation-filters': 'colorInterpolationFilters',
  colorprofile: 'colorProfile',
  'color-profile': 'colorProfile',
  colorrendering: 'colorRendering',
  'color-rendering': 'colorRendering',
  contentscripttype: 'contentScriptType',
  contentstyletype: 'contentStyleType',
  cursor: 'cursor',
  cx: 'cx',
  cy: 'cy',
  d: 'd',
  datatype: 'datatype',
  decelerate: 'decelerate',
  descent: 'descent',
  diffuseconstant: 'diffuseConstant',
  direction: 'direction',
  display: 'display',
  divisor: 'divisor',
  dominantbaseline: 'dominantBaseline',
  'dominant-baseline': 'dominantBaseline',
  dur: 'dur',
  dx: 'dx',
  dy: 'dy',
  edgemode: 'edgeMode',
  elevation: 'elevation',
  enablebackground: 'enableBackground',
  'enable-background': 'enableBackground',
  end: 'end',
  exponent: 'exponent',
  externalresourcesrequired: 'externalResourcesRequired',
  fill: 'fill',
  fillopacity: 'fillOpacity',
  'fill-opacity': 'fillOpacity',
  fillrule: 'fillRule',
  'fill-rule': 'fillRule',
  filter: 'filter',
  filterres: 'filterRes',
  filterunits: 'filterUnits',
  floodopacity: 'floodOpacity',
  'flood-opacity': 'floodOpacity',
  floodcolor: 'floodColor',
  'flood-color': 'floodColor',
  focusable: 'focusable',
  fontfamily: 'fontFamily',
  'font-family': 'fontFamily',
  fontsize: 'fontSize',
  'font-size': 'fontSize',
  fontsizeadjust: 'fontSizeAdjust',
  'font-size-adjust': 'fontSizeAdjust',
  fontstretch: 'fontStretch',
  'font-stretch': 'fontStretch',
  fontstyle: 'fontStyle',
  'font-style': 'fontStyle',
  fontvariant: 'fontVariant',
  'font-variant': 'fontVariant',
  fontweight: 'fontWeight',
  'font-weight': 'fontWeight',
  format: 'format',
  from: 'from',
  fx: 'fx',
  fy: 'fy',
  g1: 'g1',
  g2: 'g2',
  glyphname: 'glyphName',
  'glyph-name': 'glyphName',
  glyphorientationhorizontal: 'glyphOrientationHorizontal',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  glyphorientationvertical: 'glyphOrientationVertical',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  glyphref: 'glyphRef',
  gradienttransform: 'gradientTransform',
  gradientunits: 'gradientUnits',
  hanging: 'hanging',
  horizadvx: 'horizAdvX',
  'horiz-adv-x': 'horizAdvX',
  horizoriginx: 'horizOriginX',
  'horiz-origin-x': 'horizOriginX',
  ideographic: 'ideographic',
  imagerendering: 'imageRendering',
  'image-rendering': 'imageRendering',
  in2: 'in2',
  in: 'in',
  inlist: 'inlist',
  intercept: 'intercept',
  k1: 'k1',
  k2: 'k2',
  k3: 'k3',
  k4: 'k4',
  k: 'k',
  kernelmatrix: 'kernelMatrix',
  kernelunitlength: 'kernelUnitLength',
  kerning: 'kerning',
  keypoints: 'keyPoints',
  keysplines: 'keySplines',
  keytimes: 'keyTimes',
  lengthadjust: 'lengthAdjust',
  letterspacing: 'letterSpacing',
  'letter-spacing': 'letterSpacing',
  lightingcolor: 'lightingColor',
  'lighting-color': 'lightingColor',
  limitingconeangle: 'limitingConeAngle',
  local: 'local',
  markerend: 'markerEnd',
  'marker-end': 'markerEnd',
  markerheight: 'markerHeight',
  markermid: 'markerMid',
  'marker-mid': 'markerMid',
  markerstart: 'markerStart',
  'marker-start': 'markerStart',
  markerunits: 'markerUnits',
  markerwidth: 'markerWidth',
  mask: 'mask',
  maskcontentunits: 'maskContentUnits',
  maskunits: 'maskUnits',
  mathematical: 'mathematical',
  mode: 'mode',
  numoctaves: 'numOctaves',
  offset: 'offset',
  opacity: 'opacity',
  operator: 'operator',
  order: 'order',
  orient: 'orient',
  orientation: 'orientation',
  origin: 'origin',
  overflow: 'overflow',
  overlineposition: 'overlinePosition',
  'overline-position': 'overlinePosition',
  overlinethickness: 'overlineThickness',
  'overline-thickness': 'overlineThickness',
  paintorder: 'paintOrder',
  'paint-order': 'paintOrder',
  panose1: 'panose1',
  'panose-1': 'panose1',
  pathlength: 'pathLength',
  patterncontentunits: 'patternContentUnits',
  patterntransform: 'patternTransform',
  patternunits: 'patternUnits',
  pointerevents: 'pointerEvents',
  'pointer-events': 'pointerEvents',
  points: 'points',
  pointsatx: 'pointsAtX',
  pointsaty: 'pointsAtY',
  pointsatz: 'pointsAtZ',
  prefix: 'prefix',
  preservealpha: 'preserveAlpha',
  preserveaspectratio: 'preserveAspectRatio',
  primitiveunits: 'primitiveUnits',
  property: 'property',
  r: 'r',
  radius: 'radius',
  refx: 'refX',
  refy: 'refY',
  renderingintent: 'renderingIntent',
  'rendering-intent': 'renderingIntent',
  repeatcount: 'repeatCount',
  repeatdur: 'repeatDur',
  requiredextensions: 'requiredExtensions',
  requiredfeatures: 'requiredFeatures',
  resource: 'resource',
  restart: 'restart',
  result: 'result',
  results: 'results',
  rotate: 'rotate',
  rx: 'rx',
  ry: 'ry',
  scale: 'scale',
  security: 'security',
  seed: 'seed',
  shaperendering: 'shapeRendering',
  'shape-rendering': 'shapeRendering',
  slope: 'slope',
  spacing: 'spacing',
  specularconstant: 'specularConstant',
  specularexponent: 'specularExponent',
  speed: 'speed',
  spreadmethod: 'spreadMethod',
  startoffset: 'startOffset',
  stddeviation: 'stdDeviation',
  stemh: 'stemh',
  stemv: 'stemv',
  stitchtiles: 'stitchTiles',
  stopcolor: 'stopColor',
  'stop-color': 'stopColor',
  stopopacity: 'stopOpacity',
  'stop-opacity': 'stopOpacity',
  strikethroughposition: 'strikethroughPosition',
  'strikethrough-position': 'strikethroughPosition',
  strikethroughthickness: 'strikethroughThickness',
  'strikethrough-thickness': 'strikethroughThickness',
  string: 'string',
  stroke: 'stroke',
  strokedasharray: 'strokeDasharray',
  'stroke-dasharray': 'strokeDasharray',
  strokedashoffset: 'strokeDashoffset',
  'stroke-dashoffset': 'strokeDashoffset',
  strokelinecap: 'strokeLinecap',
  'stroke-linecap': 'strokeLinecap',
  strokelinejoin: 'strokeLinejoin',
  'stroke-linejoin': 'strokeLinejoin',
  strokemiterlimit: 'strokeMiterlimit',
  'stroke-miterlimit': 'strokeMiterlimit',
  strokewidth: 'strokeWidth',
  'stroke-width': 'strokeWidth',
  strokeopacity: 'strokeOpacity',
  'stroke-opacity': 'strokeOpacity',
  suppresscontenteditablewarning: 'suppressContentEditableWarning',
  suppresshydrationwarning: 'suppressHydrationWarning',
  surfacescale: 'surfaceScale',
  systemlanguage: 'systemLanguage',
  tablevalues: 'tableValues',
  targetx: 'targetX',
  targety: 'targetY',
  textanchor: 'textAnchor',
  'text-anchor': 'textAnchor',
  textdecoration: 'textDecoration',
  'text-decoration': 'textDecoration',
  textlength: 'textLength',
  textrendering: 'textRendering',
  'text-rendering': 'textRendering',
  to: 'to',
  transform: 'transform',
  typeof: 'typeof',
  u1: 'u1',
  u2: 'u2',
  underlineposition: 'underlinePosition',
  'underline-position': 'underlinePosition',
  underlinethickness: 'underlineThickness',
  'underline-thickness': 'underlineThickness',
  unicode: 'unicode',
  unicodebidi: 'unicodeBidi',
  'unicode-bidi': 'unicodeBidi',
  unicoderange: 'unicodeRange',
  'unicode-range': 'unicodeRange',
  unitsperem: 'unitsPerEm',
  'units-per-em': 'unitsPerEm',
  unselectable: 'unselectable',
  valphabetic: 'vAlphabetic',
  'v-alphabetic': 'vAlphabetic',
  values: 'values',
  vectoreffect: 'vectorEffect',
  'vector-effect': 'vectorEffect',
  version: 'version',
  vertadvy: 'vertAdvY',
  'vert-adv-y': 'vertAdvY',
  vertoriginx: 'vertOriginX',
  'vert-origin-x': 'vertOriginX',
  vertoriginy: 'vertOriginY',
  'vert-origin-y': 'vertOriginY',
  vhanging: 'vHanging',
  'v-hanging': 'vHanging',
  videographic: 'vIdeographic',
  'v-ideographic': 'vIdeographic',
  viewbox: 'viewBox',
  viewtarget: 'viewTarget',
  visibility: 'visibility',
  vmathematical: 'vMathematical',
  'v-mathematical': 'vMathematical',
  vocab: 'vocab',
  widths: 'widths',
  wordspacing: 'wordSpacing',
  'word-spacing': 'wordSpacing',
  writingmode: 'writingMode',
  'writing-mode': 'writingMode',
  x1: 'x1',
  x2: 'x2',
  x: 'x',
  xchannelselector: 'xChannelSelector',
  xheight: 'xHeight',
  'x-height': 'xHeight',
  xlinkactuate: 'xlinkActuate',
  'xlink:actuate': 'xlinkActuate',
  xlinkarcrole: 'xlinkArcrole',
  'xlink:arcrole': 'xlinkArcrole',
  xlinkhref: 'xlinkHref',
  'xlink:href': 'xlinkHref',
  xlinkrole: 'xlinkRole',
  'xlink:role': 'xlinkRole',
  xlinkshow: 'xlinkShow',
  'xlink:show': 'xlinkShow',
  xlinktitle: 'xlinkTitle',
  'xlink:title': 'xlinkTitle',
  xlinktype: 'xlinkType',
  'xlink:type': 'xlinkType',
  xmlbase: 'xmlBase',
  'xml:base': 'xmlBase',
  xmllang: 'xmlLang',
  'xml:lang': 'xmlLang',
  xmlns: 'xmlns',
  'xml:space': 'xmlSpace',
  xmlnsxlink: 'xmlnsXlink',
  'xmlns:xlink': 'xmlnsXlink',
  xmlspace: 'xmlSpace',
  y1: 'y1',
  y2: 'y2',
  y: 'y',
  ychannelselector: 'yChannelSelector',
  z: 'z',
  zoomandpan: 'zoomAndPan'
};

var validateProperty$1 = function () {};

{
  var warnedProperties$1 = {};
  var EVENT_NAME_REGEX = /^on./;
  var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
  var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
  var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

  validateProperty$1 = function (tagName, name, value, eventRegistry) {
    if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
      return true;
    }

    var lowerCasedName = name.toLowerCase();

    if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
      error('React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');

      warnedProperties$1[name] = true;
      return true;
    } // We can't rely on the event system being injected on the server.


    if (eventRegistry != null) {
      var registrationNameDependencies = eventRegistry.registrationNameDependencies,
          possibleRegistrationNames = eventRegistry.possibleRegistrationNames;

      if (registrationNameDependencies.hasOwnProperty(name)) {
        return true;
      }

      var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;

      if (registrationName != null) {
        error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);

        warnedProperties$1[name] = true;
        return true;
      }

      if (EVENT_NAME_REGEX.test(name)) {
        error('Unknown event handler property `%s`. It will be ignored.', name);

        warnedProperties$1[name] = true;
        return true;
      }
    } else if (EVENT_NAME_REGEX.test(name)) {
      // If no event plugins have been injected, we are in a server environment.
      // So we can't tell if the event name is correct for sure, but we can filter
      // out known bad ones like `onclick`. We can't suggest a specific replacement though.
      if (INVALID_EVENT_NAME_REGEX.test(name)) {
        error('Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.', name);
      }

      warnedProperties$1[name] = true;
      return true;
    } // Let the ARIA attribute hook validate ARIA attributes


    if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
      return true;
    }

    if (lowerCasedName === 'innerhtml') {
      error('Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');

      warnedProperties$1[name] = true;
      return true;
    }

    if (lowerCasedName === 'aria') {
      error('The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');

      warnedProperties$1[name] = true;
      return true;
    }

    if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
      error('Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.', typeof value);

      warnedProperties$1[name] = true;
      return true;
    }

    if (typeof value === 'number' && isNaN(value)) {
      error('Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.', name);

      warnedProperties$1[name] = true;
      return true;
    }

    var propertyInfo = getPropertyInfo(name);
    var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED; // Known attributes should match the casing specified in the property config.

    if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
      var standardName = possibleStandardNames[lowerCasedName];

      if (standardName !== name) {
        error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);

        warnedProperties$1[name] = true;
        return true;
      }
    } else if (!isReserved && name !== lowerCasedName) {
      // Unknown attributes should have lowercase casing since that's how they
      // will be cased anyway with server rendering.
      error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);

      warnedProperties$1[name] = true;
      return true;
    }

    if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      if (value) {
        error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
      } else {
        error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
      }

      warnedProperties$1[name] = true;
      return true;
    } // Now that we've validated casing, do not validate
    // data types for reserved props


    if (isReserved) {
      return true;
    } // Warn when a known attribute is a bad type


    if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      warnedProperties$1[name] = true;
      return false;
    } // Warn when passing the strings 'false' or 'true' into a boolean prop


    if ((value === 'false' || value === 'true') && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
      error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);

      warnedProperties$1[name] = true;
      return true;
    }

    return true;
  };
}

var warnUnknownProperties = function (type, props, eventRegistry) {
  {
    var unknownProps = [];

    for (var key in props) {
      var isValid = validateProperty$1(type, key, props[key], eventRegistry);

      if (!isValid) {
        unknownProps.push(key);
      }
    }

    var unknownPropString = unknownProps.map(function (prop) {
      return '`' + prop + '`';
    }).join(', ');

    if (unknownProps.length === 1) {
      error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
    } else if (unknownProps.length > 1) {
      error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
    }
  }
};

function validateProperties$2(type, props, eventRegistry) {
  if (isCustomComponent(type, props)) {
    return;
  }

  warnUnknownProperties(type, props, eventRegistry);
}

var warnValidStyle = function () {};

{
  // 'msTransform' is correct, but the other prefixes should be capitalized
  var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
  var msPattern = /^-ms-/;
  var hyphenPattern = /-(.)/g; // style values shouldn't contain a semicolon

  var badStyleValueWithSemicolonPattern = /;\s*$/;
  var warnedStyleNames = {};
  var warnedStyleValues = {};
  var warnedForNaNValue = false;
  var warnedForInfinityValue = false;

  var camelize = function (string) {
    return string.replace(hyphenPattern, function (_, character) {
      return character.toUpperCase();
    });
  };

  var warnHyphenatedStyleName = function (name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;

    error('Unsupported style property %s. Did you mean %s?', name, // As Andi Smith suggests
    // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
    // is converted to lowercase `ms`.
    camelize(name.replace(msPattern, 'ms-')));
  };

  var warnBadVendoredStyleName = function (name) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;

    error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1));
  };

  var warnStyleValueWithSemicolon = function (name, value) {
    if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
      return;
    }

    warnedStyleValues[value] = true;

    error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, ''));
  };

  var warnStyleValueIsNaN = function (name, value) {
    if (warnedForNaNValue) {
      return;
    }

    warnedForNaNValue = true;

    error('`NaN` is an invalid value for the `%s` css style property.', name);
  };

  var warnStyleValueIsInfinity = function (name, value) {
    if (warnedForInfinityValue) {
      return;
    }

    warnedForInfinityValue = true;

    error('`Infinity` is an invalid value for the `%s` css style property.', name);
  };

  warnValidStyle = function (name, value) {
    if (name.indexOf('-') > -1) {
      warnHyphenatedStyleName(name);
    } else if (badVendoredStyleNamePattern.test(name)) {
      warnBadVendoredStyleName(name);
    } else if (badStyleValueWithSemicolonPattern.test(value)) {
      warnStyleValueWithSemicolon(name, value);
    }

    if (typeof value === 'number') {
      if (isNaN(value)) {
        warnStyleValueIsNaN(name, value);
      } else if (!isFinite(value)) {
        warnStyleValueIsInfinity(name, value);
      }
    }
  };
}

var warnValidStyle$1 = warnValidStyle;

// code copied and modified from escape-html
var matchHtmlRegExp = /["'&<>]/;
/**
 * Escapes special characters and HTML entities in a given html string.
 *
 * @param  {string} string HTML string to escape for later insertion
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  {
    checkHtmlStringCoercion(string);
  }

  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        // "
        escape = '&quot;';
        break;

      case 38:
        // &
        escape = '&amp;';
        break;

      case 39:
        // '
        escape = '&#x27;'; // modified from escape-html; used to be '&#39'

        break;

      case 60:
        // <
        escape = '&lt;';
        break;

      case 62:
        // >
        escape = '&gt;';
        break;

      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
} // end code copied and modified from escape-html

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */


function escapeTextForBrowser(text) {
  if (typeof text === 'boolean' || typeof text === 'number') {
    // this shortcircuit helps perf for types that we know will never have
    // special characters, especially given that this function is used often
    // for numeric dom ids.
    return '' + text;
  }

  return escapeHtml(text);
}

var uppercasePattern = /([A-Z])/g;
var msPattern$1 = /^ms-/;
/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 */

function hyphenateStyleName(name) {
  return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern$1, '-ms-');
}

// and any newline or tab are filtered out as if they're not part of the URL.
// https://url.spec.whatwg.org/#url-parsing
// Tab or newline are defined as \r\n\t:
// https://infra.spec.whatwg.org/#ascii-tab-or-newline
// A C0 control is a code point in the range \u0000 NULL to \u001F
// INFORMATION SEPARATOR ONE, inclusive:
// https://infra.spec.whatwg.org/#c0-control-or-space

/* eslint-disable max-len */

var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
var didWarn = false;

function sanitizeURL(url) {
  {
    if (!didWarn && isJavaScriptProtocol.test(url)) {
      didWarn = true;

      error('A future version of React will block javascript: URLs as a security precaution. ' + 'Use event handlers instead if you can. If you need to generate unsafe HTML try ' + 'using dangerouslySetInnerHTML instead. React was passed %s.', JSON.stringify(url));
    }
  }
}

var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

function isArray(a) {
  return isArrayImpl(a);
}

var assign = Object.assign;

function validatePreloadResourceDifference(originalProps, originalImplicit, latestProps, latestImplicit) {
  {
    var href = originalProps.href;
    var originalWarningName = getResourceNameForWarning('preload', originalProps, originalImplicit);
    var latestWarningName = getResourceNameForWarning('preload', latestProps, latestImplicit);

    if (latestProps.as !== originalProps.as) {
      error('A %s is using the same href "%s" as a %s. This is always an error and React will only keep the first preload' + ' for any given href, discarding subsequent instances. To fix, find where you are using this href in link' + ' tags or in calls to ReactDOM.preload() or ReactDOM.preinit() and either make the Resource types agree or' + ' update the hrefs to be distinct for different Resource types.', latestWarningName, href, originalWarningName);
    } else {
      var missingProps = null;
      var extraProps = null;
      var differentProps = null;

      if (originalProps.media != null && latestProps.media == null) {
        missingProps = missingProps || {};
        missingProps.media = originalProps.media;
      }

      for (var propName in latestProps) {
        var propValue = latestProps[propName];
        var originalValue = originalProps[propName];

        if (propValue != null && propValue !== originalValue) {
          if (originalValue == null) {
            extraProps = extraProps || {};
            extraProps[propName] = propValue;
          } else {
            differentProps = differentProps || {};
            differentProps[propName] = {
              original: originalValue,
              latest: propValue
            };
          }
        }
      }

      if (missingProps || extraProps || differentProps) {
        warnDifferentProps(href, originalWarningName, latestWarningName, extraProps, missingProps, differentProps);
      }
    }
  }
}
function validateStyleResourceDifference(originalProps, latestProps) {
  {
    var href = originalProps.href; // eslint-disable-next-line no-labels

    var originalWarningName = getResourceNameForWarning('style', originalProps, false);
    var latestWarningName = getResourceNameForWarning('style', latestProps, false);
    var missingProps = null;
    var extraProps = null;
    var differentProps = null;

    if (originalProps.media != null && latestProps.media == null) {
      missingProps = missingProps || {};
      missingProps.media = originalProps.media;
    }

    for (var propName in latestProps) {
      var propValue = latestProps[propName];
      var originalValue = originalProps[propName];

      if (propValue != null && propValue !== originalValue) {
        propName = propName === 'data-rprec' ? 'precedence' : propName;

        if (originalValue == null) {
          extraProps = extraProps || {};
          extraProps[propName] = propValue;
        } else {
          differentProps = differentProps || {};
          differentProps[propName] = {
            original: originalValue,
            latest: propValue
          };
        }
      }
    }

    if (missingProps || extraProps || differentProps) {
      warnDifferentProps(href, originalWarningName, latestWarningName, extraProps, missingProps, differentProps);
    }
  }
}
function validateStyleAndHintProps(preloadProps, styleProps, implicitPreload) {
  {
    var href = preloadProps.href;
    var originalWarningName = getResourceNameForWarning('preload', preloadProps, implicitPreload);
    var latestWarningName = getResourceNameForWarning('style', styleProps, false);

    if (preloadProps.as !== 'style') {
      error('While creating a %s for href "%s" a %s for this same href was found. When preloading a stylesheet the' + ' "as" prop must be of type "style". This most likely ocurred by rending a preload link with an incorrect' + ' "as" prop or by calling ReactDOM.preload with an incorrect "as" option.', latestWarningName, href, originalWarningName);
    }

    var missingProps = null;
    var extraProps = null;
    var differentProps = null;

    for (var propName in styleProps) {
      var styleValue = styleProps[propName];
      var preloadValue = preloadProps[propName];

      switch (propName) {
        // Check for difference on specific props that cross over or influence
        // the relationship between the preload and stylesheet
        case 'crossOrigin':
        case 'referrerPolicy':
        case 'media':
        case 'title':
          {
            if (preloadValue !== styleValue && !(preloadValue == null && styleValue == null)) {
              if (styleValue == null) {
                missingProps = missingProps || {};
                missingProps[propName] = preloadValue;
              } else if (preloadValue == null) {
                extraProps = extraProps || {};
                extraProps[propName] = styleValue;
              } else {
                differentProps = differentProps || {};
                differentProps[propName] = {
                  original: preloadValue,
                  latest: styleValue
                };
              }
            }
          }
      }
    }

    if (missingProps || extraProps || differentProps) {
      warnDifferentProps(href, originalWarningName, latestWarningName, extraProps, missingProps, differentProps);
    }
  }
}

function warnDifferentProps(href, originalName, latestName, extraProps, missingProps, differentProps) {
  {
    var juxtaposedNameStatement = latestName === originalName ? 'an earlier instance of this Resource' : "a " + originalName + " with the same href";
    var comparisonStatement = '';

    if (missingProps !== null && typeof missingProps === 'object') {
      for (var propName in missingProps) {
        comparisonStatement += "\n  " + propName + ": missing or null in latest props, \"" + missingProps[propName] + "\" in original props";
      }
    }

    if (extraProps !== null && typeof extraProps === 'object') {
      for (var _propName in extraProps) {
        comparisonStatement += "\n  " + _propName + ": \"" + extraProps[_propName] + "\" in latest props, missing or null in original props";
      }
    }

    if (differentProps !== null && typeof differentProps === 'object') {
      for (var _propName2 in differentProps) {
        comparisonStatement += "\n  " + _propName2 + ": \"" + differentProps[_propName2].latest + "\" in latest props, \"" + differentProps[_propName2].original + "\" in original props";
      }
    }

    error('A %s with href "%s" has props that disagree with those found on %s. Resources always use the props' + ' that were provided the first time they are encountered so any differences will be ignored. Please' + ' update Resources that share an href to have props that agree. The differences are described below.%s', latestName, href, juxtaposedNameStatement, comparisonStatement);
  }
}

function getResourceNameForWarning(type, props, implicit) {
  {
    switch (type) {
      case 'style':
        {
          return 'style Resource';
        }

      case 'preload':
        {
          if (implicit) {
            return "preload for a " + props.as + " Resource";
          }

          return "preload Resource (as \"" + props.as + "\")";
        }
    }
  }

  return 'Resource';
}
function validateLinkPropsForStyleResource(props) {
  {
    // This should only be called when we know we are opting into Resource semantics (i.e. precedence is not null)
    var href = props.href,
        onLoad = props.onLoad,
        onError = props.onError,
        disabled = props.disabled;
    var allProps = ['onLoad', 'onError', 'disabled'];
    var includedProps = [];
    if (onLoad) includedProps.push('onLoad');
    if (onError) includedProps.push('onError');
    if (disabled != null) includedProps.push('disabled');
    var allPropsUnionPhrase = propNamesListJoin(allProps, 'or');
    var includedPropsPhrase = propNamesListJoin(includedProps, 'and');
    includedPropsPhrase += includedProps.length === 1 ? ' prop' : ' props';

    if (includedProps.length) {
      error('A link (rel="stylesheet") element with href "%s" has the precedence prop but also included the %s.' + ' When using %s React will opt out of Resource behavior. If you meant for this' + ' element to be treated as a Resource remove the %s. Otherwise remove the precedence prop.', href, includedPropsPhrase, allPropsUnionPhrase, includedPropsPhrase);

      return true;
    }
  }

  return false;
}

function propNamesListJoin(list, combinator) {
  switch (list.length) {
    case 0:
      return '';

    case 1:
      return list[0];

    case 2:
      return list[0] + ' ' + combinator + ' ' + list[1];

    default:
      return list.slice(0, -1).join(', ') + ', ' + combinator + ' ' + list[list.length - 1];
  }
}

function validateLinkPropsForPreloadResource(linkProps) {
  {
    var href = linkProps.href,
        as = linkProps.as;

    if (as === 'font') {
      var name = getResourceNameForWarning('preload', linkProps, false);

      if (!hasOwnProperty.call(linkProps, 'crossOrigin')) {
        error('A %s with href "%s" did not specify the crossOrigin prop. Font preloads must always use' + ' anonymouse CORS mode. To fix add an empty string, "anonymous", or any other string' + ' value except "use-credentials" for the crossOrigin prop of all font preloads.', name, href);
      } else if (linkProps.crossOrigin === 'use-credentials') {
        error('A %s with href "%s" specified a crossOrigin value of "use-credentials". Font preloads must always use' + ' anonymouse CORS mode. To fix use an empty string, "anonymous", or any other string' + ' value except "use-credentials" for the crossOrigin prop of all font preloads.', name, href);
      }
    }
  }
}
function validatePreloadArguments(href, options) {
  {
    if (!href || typeof href !== 'string') {
      var typeOfArg = getValueDescriptorExpectingObjectForWarning(href);

      error('ReactDOM.preload() expected the first argument to be a string representing an href but found %s instead.', typeOfArg);
    } else if (typeof options !== 'object' || options === null) {
      var _typeOfArg = getValueDescriptorExpectingObjectForWarning(options);

      error('ReactDOM.preload() expected the second argument to be an options argument containing at least an "as" property' + ' specifying the Resource type. It found %s instead. The href for the preload call where this warning originated is "%s".', _typeOfArg, href);
    } else {
      var as = options.as;

      switch (as) {
        // Font specific validation of options
        case 'font':
          {
            if (options.crossOrigin === 'use-credentials') {
              error('ReactDOM.preload() was called with an "as" type of "font" and with a "crossOrigin" option of "use-credentials".' + ' Fonts preloading must use crossOrigin "anonymous" to be functional. Please update your font preload to omit' + ' the crossOrigin option or change it to any other value than "use-credentials" (Browsers default all other values' + ' to anonymous mode). The href for the preload call where this warning originated is "%s"', href);
            }

            break;
          }

        case 'script':
        case 'style':
          {
            break;
          }
        // We have an invalid as type and need to warn

        default:
          {
            var typeOfAs = getValueDescriptorExpectingEnumForWarning(as);

            error('ReactDOM.preload() expected a valid "as" type in the options (second) argument but found %s instead.' + ' Please use one of the following valid values instead: %s. The href for the preload call where this' + ' warning originated is "%s".', typeOfAs, '"style", "font", or "script"', href);
          }
      }
    }
  }
}
function validatePreinitArguments(href, options) {
  {
    if (!href || typeof href !== 'string') {
      var typeOfArg = getValueDescriptorExpectingObjectForWarning(href);

      error('ReactDOM.preinit() expected the first argument to be a string representing an href but found %s instead.', typeOfArg);
    } else if (typeof options !== 'object' || options === null) {
      var _typeOfArg2 = getValueDescriptorExpectingObjectForWarning(options);

      error('ReactDOM.preinit() expected the second argument to be an options argument containing at least an "as" property' + ' specifying the Resource type. It found %s instead. The href for the preload call where this warning originated is "%s".', _typeOfArg2, href);
    } else {
      var as = options.as;

      switch (as) {
        case 'style':
          {
            break;
          }
        // We have an invalid as type and need to warn

        default:
          {
            var typeOfAs = getValueDescriptorExpectingEnumForWarning(as);

            error('ReactDOM.preinit() expected the second argument to be an options argument containing at least an "as" property' + ' specifying the Resource type. It found %s instead. Currently, the only valid resource type for preinit is "style".' + ' The href for the preinit call where this warning originated is "%s".', typeOfAs, href);
          }
      }
    }
  }
}

function getValueDescriptorExpectingObjectForWarning(thing) {
  return thing === null ? 'null' : thing === undefined ? 'undefined' : thing === '' ? 'an empty string' : "something with type \"" + typeof thing + "\"";
}

function getValueDescriptorExpectingEnumForWarning(thing) {
  return thing === null ? 'null' : thing === undefined ? 'undefined' : thing === '' ? 'an empty string' : typeof thing === 'string' ? JSON.stringify(thing) : "something with type \"" + typeof thing + "\"";
}

// @TODO add bootstrap script to implicit preloads
function createResources() {
  return {
    // persistent
    preloadsMap: new Map(),
    stylesMap: new Map(),
    // cleared on flush
    explicitPreloads: new Set(),
    implicitPreloads: new Set(),
    precedences: new Map(),
    // like a module global for currently rendering boundary
    boundaryResources: null
  };
}
function createBoundaryResources() {
  return new Set();
}
function mergeBoundaryResources(target, source) {
  source.forEach(function (resource) {
    return target.add(resource);
  });
}
var currentResources = null;
var currentResourcesStack = [];
function prepareToRenderResources(resources) {
  currentResourcesStack.push(currentResources);
  currentResources = resources;
}
function finishRenderingResources() {
  currentResources = currentResourcesStack.pop();
}
function setCurrentlyRenderingBoundaryResourcesTarget(resources, boundaryResources) {
  resources.boundaryResources = boundaryResources;
}
var ReactDOMServerDispatcher = {
  preload: preload,
  preinit: preinit
};

function preload(href, options) {
  if (!currentResources) {
    // While we expect that preload calls are primarily going to be observed
    // during render because effects and events don't run on the server it is
    // still possible that these get called in module scope. This is valid on
    // the client since there is still a document to interact with but on the
    // server we need a request to associate the call to. Because of this we
    // simply return and do not warn.
    return;
  }

  {
    validatePreloadArguments(href, options);
  }

  if (typeof href === 'string' && href && typeof options === 'object' && options !== null) {
    var as = options.as; // $FlowFixMe[incompatible-use] found when upgrading Flow

    var resource = currentResources.preloadsMap.get(href);

    if (resource) {
      {
        var originallyImplicit = resource._dev_implicit_construction === true;
        var latestProps = preloadPropsFromPreloadOptions(href, as, options);
        validatePreloadResourceDifference(resource.props, originallyImplicit, latestProps, false);
      }
    } else {
      resource = createPreloadResource( // $FlowFixMe[incompatible-call] found when upgrading Flow
      currentResources, href, as, preloadPropsFromPreloadOptions(href, as, options));
    } // $FlowFixMe[incompatible-call] found when upgrading Flow


    captureExplicitPreloadResourceDependency(currentResources, resource);
  }
}

function preinit(href, options) {
  if (!currentResources) {
    // While we expect that preinit calls are primarily going to be observed
    // during render because effects and events don't run on the server it is
    // still possible that these get called in module scope. This is valid on
    // the client since there is still a document to interact with but on the
    // server we need a request to associate the call to. Because of this we
    // simply return and do not warn.
    return;
  }

  {
    validatePreinitArguments(href, options);
  }

  if (typeof href === 'string' && href && typeof options === 'object' && options !== null) {
    var as = options.as;

    switch (as) {
      case 'style':
        {
          var precedence = options.precedence || 'default'; // $FlowFixMe[incompatible-use] found when upgrading Flow

          var resource = currentResources.stylesMap.get(href);

          if (resource) {
            {
              var latestProps = stylePropsFromPreinitOptions(href, precedence, options);
              validateStyleResourceDifference(resource.props, latestProps);
            }
          } else {
            var resourceProps = stylePropsFromPreinitOptions(href, precedence, options);
            resource = createStyleResource( // $FlowFixMe[incompatible-call] found when upgrading Flow
            currentResources, href, precedence, resourceProps);
          } // Do not associate preinit style resources with any specific boundary regardless of where it is called
          // $FlowFixMe[incompatible-call] found when upgrading Flow


          captureStyleResourceDependency(currentResources, null, resource);
          return;
        }
    }
  }
}

function preloadPropsFromPreloadOptions(href, as, options) {
  return {
    href: href,
    rel: 'preload',
    as: as,
    crossOrigin: as === 'font' ? '' : options.crossOrigin,
    integrity: options.integrity
  };
}

function preloadPropsFromRawProps(href, as, rawProps) {
  var props = assign({}, rawProps);

  props.href = href;
  props.rel = 'preload';
  props.as = as;

  if (as === 'font') {
    // Font preloads always need CORS anonymous mode so we set it here
    // regardless of the props provided. This should warn elsewhere in
    // dev
    props.crossOrigin = '';
  }

  return props;
}

function preloadAsStylePropsFromProps(href, props) {
  return {
    rel: 'preload',
    as: 'style',
    href: href,
    crossOrigin: props.crossOrigin,
    integrity: props.integrity,
    media: props.media,
    hrefLang: props.hrefLang,
    referrerPolicy: props.referrerPolicy
  };
}

function createPreloadResource(resources, href, as, props) {
  var preloadsMap = resources.preloadsMap;

  {
    if (preloadsMap.has(href)) {
      error('createPreloadResource was called when a preload Resource matching the same href already exists. This is a bug in React.');
    }
  }

  var resource = {
    type: 'preload',
    as: as,
    href: href,
    flushed: false,
    props: props
  };
  preloadsMap.set(href, resource);
  return resource;
}

function stylePropsFromRawProps(href, precedence, rawProps) {
  var props = assign({}, rawProps);

  props.href = href;
  props.rel = 'stylesheet';
  props['data-rprec'] = precedence;
  delete props.precedence;
  return props;
}

function stylePropsFromPreinitOptions(href, precedence, options) {
  return {
    rel: 'stylesheet',
    href: href,
    'data-rprec': precedence,
    crossOrigin: options.crossOrigin
  };
}

function createStyleResource(resources, href, precedence, props) {
  {
    if (resources.stylesMap.has(href)) {
      error('createStyleResource was called when a style Resource matching the same href already exists. This is a bug in React.');
    }
  }

  var stylesMap = resources.stylesMap,
      preloadsMap = resources.preloadsMap;
  var hint = preloadsMap.get(href);

  if (hint) {
    // If a preload for this style Resource already exists there are certain props we want to adopt
    // on the style Resource, primarily focussed on making sure the style network pathways utilize
    // the preload pathways. For instance if you have diffreent crossOrigin attributes for a preload
    // and a stylesheet the stylesheet will make a new request even if the preload had already loaded
    var preloadProps = hint.props;
    if (props.crossOrigin == null) props.crossOrigin = preloadProps.crossOrigin;
    if (props.referrerPolicy == null) props.referrerPolicy = preloadProps.referrerPolicy;
    if (props.media == null) props.media = preloadProps.media;
    if (props.title == null) props.title = preloadProps.title;

    {
      validateStyleAndHintProps(preloadProps, props, hint._dev_implicit_construction);
    }
  } else {
    var preloadResourceProps = preloadAsStylePropsFromProps(href, props);
    hint = createPreloadResource(resources, href, 'style', preloadResourceProps);

    {
      hint._dev_implicit_construction = true;
    }

    captureImplicitPreloadResourceDependency(resources, hint);
  }

  var resource = {
    type: 'style',
    href: href,
    precedence: precedence,
    flushed: false,
    inShell: false,
    props: props,
    hint: hint
  };
  stylesMap.set(href, resource);
  return resource;
}

function captureStyleResourceDependency(resources, boundaryResources, styleResource) {
  var precedences = resources.precedences;
  var precedence = styleResource.precedence;

  if (boundaryResources) {
    boundaryResources.add(styleResource);

    if (!precedences.has(precedence)) {
      precedences.set(precedence, new Set());
    }
  } else {
    var set = precedences.get(precedence);

    if (!set) {
      set = new Set();
      precedences.set(precedence, set);
    }

    set.add(styleResource);
  }
}

function captureExplicitPreloadResourceDependency(resources, preloadResource) {
  resources.explicitPreloads.add(preloadResource);
}

function captureImplicitPreloadResourceDependency(resources, preloadResource) {
  resources.implicitPreloads.add(preloadResource);
} // Construct a resource from link props.


function resourcesFromLink(props) {
  if (!currentResources) {
    throw new Error('"currentResources" was expected to exist. This is a bug in React.');
  }

  var rel = props.rel,
      href = props.href;

  if (!href || typeof href !== 'string') {
    return false;
  }

  switch (rel) {
    case 'stylesheet':
      {
        var onLoad = props.onLoad,
            onError = props.onError,
            precedence = props.precedence,
            disabled = props.disabled;

        if (typeof precedence !== 'string' || onLoad || onError || disabled != null) {
          // This stylesheet is either not opted into Resource semantics or has conflicting properties which
          // disqualify it for such. We can still create a preload resource to help it load faster on the
          // client
          {
            validateLinkPropsForStyleResource(props);
          } // $FlowFixMe[incompatible-use] found when upgrading Flow


          var preloadResource = currentResources.preloadsMap.get(href);

          if (!preloadResource) {
            preloadResource = createPreloadResource( // $FlowFixMe[incompatible-call] found when upgrading Flow
            currentResources, href, 'style', preloadAsStylePropsFromProps(href, props));

            {
              preloadResource._dev_implicit_construction = true;
            }
          }

          captureImplicitPreloadResourceDependency( // $FlowFixMe[incompatible-call] found when upgrading Flow
          currentResources, preloadResource);
          return false;
        } else {
          // We are able to convert this link element to a resource exclusively. We construct the relevant Resource
          // and return true indicating that this link was fully consumed.
          var resource = currentResources.stylesMap.get(href);

          if (resource) {
            {
              var resourceProps = stylePropsFromRawProps(href, precedence, props);
              validateStyleResourceDifference(resource.props, resourceProps);
            }
          } else {
            var _resourceProps = stylePropsFromRawProps(href, precedence, props);

            resource = createStyleResource( // $FlowFixMe[incompatible-call] found when upgrading Flow
            currentResources, href, precedence, _resourceProps);
          }

          captureStyleResourceDependency( // $FlowFixMe[incompatible-call] found when upgrading Flow
          currentResources, // $FlowFixMe[incompatible-use] found when upgrading Flow
          currentResources.boundaryResources, resource);
          return true;
        }
      }

    case 'preload':
      {
        var as = props.as,
            _onLoad = props.onLoad,
            _onError = props.onError;

        if (_onLoad || _onError) {
          // these props signal an opt-out of Resource semantics. We don't warn because there is no
          // conflicting opt-in like there is with Style Resources
          return false;
        }

        switch (as) {
          case 'script':
          case 'style':
          case 'font':
            {
              {
                validateLinkPropsForPreloadResource(props);
              } // $FlowFixMe[incompatible-use] found when upgrading Flow


              var _resource = currentResources.preloadsMap.get(href);

              if (_resource) {
                {
                  var originallyImplicit = _resource._dev_implicit_construction === true;
                  var latestProps = preloadPropsFromRawProps(href, as, props);
                  validatePreloadResourceDifference(_resource.props, originallyImplicit, latestProps, false);
                }
              } else {
                _resource = createPreloadResource( // $FlowFixMe[incompatible-call] found when upgrading Flow
                currentResources, href, as, preloadPropsFromRawProps(href, as, props));
              } // $FlowFixMe[incompatible-call] found when upgrading Flow


              captureExplicitPreloadResourceDependency(currentResources, _resource);
              return true;
            }
        }

        return false;
      }
  }

  return false;
}
function hoistResources(resources, source) {
  if (resources.boundaryResources) {
    mergeBoundaryResources(resources.boundaryResources, source);
    source.clear();
  }
}
function hoistResourcesToRoot(resources, boundaryResources) {
  boundaryResources.forEach(function (resource) {
    // all precedences are set upon discovery. so we know we will have a set here
    var set = resources.precedences.get(resource.precedence);
    set.add(resource);
  });
  boundaryResources.clear();
}

var ReactDOMSharedInternals = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

var ReactDOMCurrentDispatcher = ReactDOMSharedInternals.Dispatcher;
function prepareToRender(resources) {
  prepareToRenderResources(resources);
  var previousHostDispatcher = ReactDOMCurrentDispatcher.current;
  ReactDOMCurrentDispatcher.current = ReactDOMServerDispatcher;
  return previousHostDispatcher;
}
function cleanupAfterRender(previousDispatcher) {
  finishRenderingResources();
  ReactDOMCurrentDispatcher.current = previousDispatcher;
} // Used to distinguish these contexts from ones used in other renderers.

var startInlineScript = stringToPrecomputedChunk('<script>');
var endInlineScript = stringToPrecomputedChunk('</script>');
var startScriptSrc = stringToPrecomputedChunk('<script src="');
var startModuleSrc = stringToPrecomputedChunk('<script type="module" src="');
var scriptIntegirty = stringToPrecomputedChunk('" integrity="');
var endAsyncScript = stringToPrecomputedChunk('" async=""></script>');
/**
 * This escaping function is designed to work with bootstrapScriptContent only.
 * because we know we are escaping the entire script. We can avoid for instance
 * escaping html comment string sequences that are valid javascript as well because
 * if there are no sebsequent <script sequences the html parser will never enter
 * script data double escaped state (see: https://www.w3.org/TR/html53/syntax.html#script-data-double-escaped-state)
 *
 * While untrusted script content should be made safe before using this api it will
 * ensure that the script cannot be early terminated or never terminated state
 */

function escapeBootstrapScriptContent(scriptText) {
  {
    checkHtmlStringCoercion(scriptText);
  }

  return ('' + scriptText).replace(scriptRegex, scriptReplacer);
}

var scriptRegex = /(<\/|<)(s)(cript)/gi;

var scriptReplacer = function (match, prefix, s, suffix) {
  return "" + prefix + (s === 's' ? "\\u0073" : "\\u0053") + suffix;
};

// Allows us to keep track of what we've already written so we can refer back to it.
function createResponseState(identifierPrefix, nonce, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
  var idPrefix = identifierPrefix === undefined ? '' : identifierPrefix;
  var inlineScriptWithNonce = nonce === undefined ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(nonce) + '">');
  var bootstrapChunks = [];

  if (bootstrapScriptContent !== undefined) {
    bootstrapChunks.push(inlineScriptWithNonce, stringToChunk(escapeBootstrapScriptContent(bootstrapScriptContent)), endInlineScript);
  }

  if (bootstrapScripts !== undefined) {
    for (var i = 0; i < bootstrapScripts.length; i++) {
      var scriptConfig = bootstrapScripts[i];
      var src = typeof scriptConfig === 'string' ? scriptConfig : scriptConfig.src;
      var integrity = typeof scriptConfig === 'string' ? undefined : scriptConfig.integrity;
      bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(src)));

      if (integrity) {
        bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(integrity)));
      }

      bootstrapChunks.push(endAsyncScript);
    }
  }

  if (bootstrapModules !== undefined) {
    for (var _i = 0; _i < bootstrapModules.length; _i++) {
      var _scriptConfig = bootstrapModules[_i];

      var _src = typeof _scriptConfig === 'string' ? _scriptConfig : _scriptConfig.src;

      var _integrity = typeof _scriptConfig === 'string' ? undefined : _scriptConfig.integrity;

      bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(_src)));

      if (_integrity) {
        bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(_integrity)));
      }

      bootstrapChunks.push(endAsyncScript);
    }
  }

  return {
    bootstrapChunks: bootstrapChunks,
    startInlineScript: inlineScriptWithNonce,
    placeholderPrefix: stringToPrecomputedChunk(idPrefix + 'P:'),
    segmentPrefix: stringToPrecomputedChunk(idPrefix + 'S:'),
    boundaryPrefix: idPrefix + 'B:',
    idPrefix: idPrefix,
    nextSuspenseID: 0,
    sentCompleteSegmentFunction: false,
    sentCompleteBoundaryFunction: false,
    sentClientRenderFunction: false,
    sentStyleInsertionFunction: false
  };
} // Constants for the insertion mode we're currently writing in. We don't encode all HTML5 insertion
// modes. We only include the variants as they matter for the sake of our purposes.
// We don't actually provide the namespace therefore we use constants instead of the string.

var ROOT_HTML_MODE = 0; // Used for the root most element tag.

var HTML_MODE = 1;
var SVG_MODE = 2;
var MATHML_MODE = 3;
var HTML_TABLE_MODE = 4;
var HTML_TABLE_BODY_MODE = 5;
var HTML_TABLE_ROW_MODE = 6;
var HTML_COLGROUP_MODE = 7; // We have a greater than HTML_TABLE_MODE check elsewhere. If you add more cases here, make sure it
// still makes sense

function createFormatContext(insertionMode, selectedValue) {
  return {
    insertionMode: insertionMode,
    selectedValue: selectedValue
  };
}

function createRootFormatContext(namespaceURI) {
  var insertionMode = namespaceURI === 'http://www.w3.org/2000/svg' ? SVG_MODE : namespaceURI === 'http://www.w3.org/1998/Math/MathML' ? MATHML_MODE : ROOT_HTML_MODE;
  return createFormatContext(insertionMode, null);
}
function getChildFormatContext(parentContext, type, props) {
  switch (type) {
    case 'select':
      return createFormatContext(HTML_MODE, props.value != null ? props.value : props.defaultValue);

    case 'svg':
      return createFormatContext(SVG_MODE, null);

    case 'math':
      return createFormatContext(MATHML_MODE, null);

    case 'foreignObject':
      return createFormatContext(HTML_MODE, null);
    // Table parents are special in that their children can only be created at all if they're
    // wrapped in a table parent. So we need to encode that we're entering this mode.

    case 'table':
      return createFormatContext(HTML_TABLE_MODE, null);

    case 'thead':
    case 'tbody':
    case 'tfoot':
      return createFormatContext(HTML_TABLE_BODY_MODE, null);

    case 'colgroup':
      return createFormatContext(HTML_COLGROUP_MODE, null);

    case 'tr':
      return createFormatContext(HTML_TABLE_ROW_MODE, null);
  }

  if (parentContext.insertionMode >= HTML_TABLE_MODE) {
    // Whatever tag this was, it wasn't a table parent or other special parent, so we must have
    // entered plain HTML again.
    return createFormatContext(HTML_MODE, null);
  }

  if (parentContext.insertionMode === ROOT_HTML_MODE) {
    // We've emitted the root and is now in plain HTML mode.
    return createFormatContext(HTML_MODE, null);
  }

  return parentContext;
}
var UNINITIALIZED_SUSPENSE_BOUNDARY_ID = null;
function assignSuspenseBoundaryID(responseState) {
  var generatedID = responseState.nextSuspenseID++;
  return stringToPrecomputedChunk(responseState.boundaryPrefix + generatedID.toString(16));
}
function makeId(responseState, treeId, localId) {
  var idPrefix = responseState.idPrefix;
  var id = ':' + idPrefix + 'R' + treeId; // Unless this is the first id at this level, append a number at the end
  // that represents the position of this useId hook among all the useId
  // hooks for this fiber.

  if (localId > 0) {
    id += 'H' + localId.toString(32);
  }

  return id + ':';
}

function encodeHTMLTextNode(text) {
  return escapeTextForBrowser(text);
}

var textSeparator = stringToPrecomputedChunk('<!-- -->');
function pushTextInstance(target, text, responseState, textEmbedded) {
  if (text === '') {
    // Empty text doesn't have a DOM node representation and the hydration is aware of this.
    return textEmbedded;
  }

  if (textEmbedded) {
    target.push(textSeparator);
  }

  target.push(stringToChunk(encodeHTMLTextNode(text)));
  return true;
} // Called when Fizz is done with a Segment. Currently the only purpose is to conditionally
// emit a text separator when we don't know for sure it is safe to omit

function pushSegmentFinale(target, responseState, lastPushedText, textEmbedded) {
  if (lastPushedText && textEmbedded) {
    target.push(textSeparator);
  }
}
var styleNameCache = new Map();

function processStyleName(styleName) {
  var chunk = styleNameCache.get(styleName);

  if (chunk !== undefined) {
    return chunk;
  }

  var result = stringToPrecomputedChunk(escapeTextForBrowser(hyphenateStyleName(styleName)));
  styleNameCache.set(styleName, result);
  return result;
}

var styleAttributeStart = stringToPrecomputedChunk(' style="');
var styleAssign = stringToPrecomputedChunk(':');
var styleSeparator = stringToPrecomputedChunk(';');

function pushStyle(target, responseState, style) {
  if (typeof style !== 'object') {
    throw new Error('The `style` prop expects a mapping from style properties to values, ' + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + 'using JSX.');
  }

  var isFirst = true;

  for (var styleName in style) {
    if (!hasOwnProperty.call(style, styleName)) {
      continue;
    } // If you provide unsafe user data here they can inject arbitrary CSS
    // which may be problematic (I couldn't repro this):
    // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
    // This is not an XSS hole but instead a potential CSS injection issue
    // which has lead to a greater discussion about how we're going to
    // trust URLs moving forward. See #2115901


    var styleValue = style[styleName];

    if (styleValue == null || typeof styleValue === 'boolean' || styleValue === '') {
      // TODO: We used to set empty string as a style with an empty value. Does that ever make sense?
      continue;
    }

    var nameChunk = void 0;
    var valueChunk = void 0;
    var isCustomProperty = styleName.indexOf('--') === 0;

    if (isCustomProperty) {
      nameChunk = stringToChunk(escapeTextForBrowser(styleName));

      {
        checkCSSPropertyStringCoercion(styleValue, styleName);
      }

      valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
    } else {
      {
        warnValidStyle$1(styleName, styleValue);
      }

      nameChunk = processStyleName(styleName);

      if (typeof styleValue === 'number') {
        if (styleValue !== 0 && !hasOwnProperty.call(isUnitlessNumber, styleName)) {
          valueChunk = stringToChunk(styleValue + 'px'); // Presumes implicit 'px' suffix for unitless numbers
        } else {
          valueChunk = stringToChunk('' + styleValue);
        }
      } else {
        {
          checkCSSPropertyStringCoercion(styleValue, styleName);
        }

        valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
      }
    }

    if (isFirst) {
      isFirst = false; // If it's first, we don't need any separators prefixed.

      target.push(styleAttributeStart, nameChunk, styleAssign, valueChunk);
    } else {
      target.push(styleSeparator, nameChunk, styleAssign, valueChunk);
    }
  }

  if (!isFirst) {
    target.push(attributeEnd);
  }
}

var attributeSeparator = stringToPrecomputedChunk(' ');
var attributeAssign = stringToPrecomputedChunk('="');
var attributeEnd = stringToPrecomputedChunk('"');
var attributeEmptyString = stringToPrecomputedChunk('=""');

function pushAttribute(target, responseState, name, value) {
  switch (name) {
    case 'style':
      {
        pushStyle(target, responseState, value);
        return;
      }

    case 'defaultValue':
    case 'defaultChecked': // These shouldn't be set as attributes on generic HTML elements.

    case 'innerHTML': // Must use dangerouslySetInnerHTML instead.

    case 'suppressContentEditableWarning':
    case 'suppressHydrationWarning':
      // Ignored. These are built-in to React on the client.
      return;
  }

  if ( // shouldIgnoreAttribute
  // We have already filtered out null/undefined and reserved words.
  name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
    return;
  }

  var propertyInfo = getPropertyInfo(name);

  if (propertyInfo !== null) {
    // shouldRemoveAttribute
    switch (typeof value) {
      case 'function':
      case 'symbol':
        // eslint-disable-line
        return;

      case 'boolean':
        {
          if (!propertyInfo.acceptsBooleans) {
            return;
          }
        }
    }

    var attributeName = propertyInfo.attributeName;
    var attributeNameChunk = stringToChunk(attributeName); // TODO: If it's known we can cache the chunk.

    switch (propertyInfo.type) {
      case BOOLEAN:
        if (value) {
          target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
        }

        return;

      case OVERLOADED_BOOLEAN:
        if (value === true) {
          target.push(attributeSeparator, attributeNameChunk, attributeEmptyString);
        } else if (value === false) ; else {
          target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }

        return;

      case NUMERIC:
        if (!isNaN(value)) {
          target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }

        break;

      case POSITIVE_NUMERIC:
        if (!isNaN(value) && value >= 1) {
          target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }

        break;

      default:
        if (propertyInfo.sanitizeURL) {
          {
            checkAttributeStringCoercion(value, attributeName);
          }

          value = '' + value;
          sanitizeURL(value);
        }

        target.push(attributeSeparator, attributeNameChunk, attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
    }
  } else if (isAttributeNameSafe(name)) {
    // shouldRemoveAttribute
    switch (typeof value) {
      case 'function':
      case 'symbol':
        // eslint-disable-line
        return;

      case 'boolean':
        {
          var prefix = name.toLowerCase().slice(0, 5);

          if (prefix !== 'data-' && prefix !== 'aria-') {
            return;
          }
        }
    }

    target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
  }
}

var endOfStartTag = stringToPrecomputedChunk('>');
var endOfStartTagSelfClosing = stringToPrecomputedChunk('/>');

function pushInnerHTML(target, innerHTML, children) {
  if (innerHTML != null) {
    if (children != null) {
      throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
    }

    if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
      throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://reactjs.org/link/dangerously-set-inner-html ' + 'for more information.');
    }

    var html = innerHTML.__html;

    if (html !== null && html !== undefined) {
      {
        checkHtmlStringCoercion(html);
      }

      target.push(stringToChunk('' + html));
    }
  }
} // TODO: Move these to ResponseState so that we warn for every request.
// It would help debugging in stateful servers (e.g. service worker).


var didWarnDefaultInputValue = false;
var didWarnDefaultChecked = false;
var didWarnDefaultSelectValue = false;
var didWarnDefaultTextareaValue = false;
var didWarnInvalidOptionChildren = false;
var didWarnInvalidOptionInnerHTML = false;
var didWarnSelectedSetOnOption = false;

function checkSelectProp(props, propName) {
  {
    var value = props[propName];

    if (value != null) {
      var array = isArray(value);

      if (props.multiple && !array) {
        error('The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.', propName);
      } else if (!props.multiple && array) {
        error('The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.', propName);
      }
    }
  }
}

function pushStartSelect(target, props, responseState) {
  {
    checkControlledValueProps('select', props);
    checkSelectProp(props, 'value');
    checkSelectProp(props, 'defaultValue');

    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultSelectValue) {
      error('Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');

      didWarnDefaultSelectValue = true;
    }
  }

  target.push(startChunkForTag('select'));
  var children = null;
  var innerHTML = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          // TODO: This doesn't really make sense for select since it can't use the controlled
          // value in the innerHTML.
          innerHTML = propValue;
          break;

        case 'defaultValue':
        case 'value':
          // These are set on the Context instead and applied to the nested options.
          break;

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}

function flattenOptionChildren(children) {
  var content = ''; // Flatten children and warn if they aren't strings or numbers;
  // invalid types are ignored.

  React.Children.forEach(children, function (child) {
    if (child == null) {
      return;
    }

    content += child;

    {
      if (!didWarnInvalidOptionChildren && typeof child !== 'string' && typeof child !== 'number') {
        didWarnInvalidOptionChildren = true;

        error('Cannot infer the option value of complex children. ' + 'Pass a `value` prop or use a plain string as children to <option>.');
      }
    }
  });
  return content;
}

var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""');

function pushStartOption(target, props, responseState, formatContext) {
  var selectedValue = formatContext.selectedValue;
  target.push(startChunkForTag('option'));
  var children = null;
  var value = null;
  var selected = null;
  var innerHTML = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'selected':
          // ignore
          selected = propValue;

          {
            // TODO: Remove support for `selected` in <option>.
            if (!didWarnSelectedSetOnOption) {
              error('Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');

              didWarnSelectedSetOnOption = true;
            }
          }

          break;

        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        // eslint-disable-next-line-no-fallthrough

        case 'value':
          value = propValue;
        // We intentionally fallthrough to also set the attribute on the node.
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  if (selectedValue != null) {
    var stringValue;

    if (value !== null) {
      {
        checkAttributeStringCoercion(value, 'value');
      }

      stringValue = '' + value;
    } else {
      {
        if (innerHTML !== null) {
          if (!didWarnInvalidOptionInnerHTML) {
            didWarnInvalidOptionInnerHTML = true;

            error('Pass a `value` prop if you set dangerouslyInnerHTML so React knows ' + 'which value should be selected.');
          }
        }
      }

      stringValue = flattenOptionChildren(children);
    }

    if (isArray(selectedValue)) {
      // multiple
      for (var i = 0; i < selectedValue.length; i++) {
        {
          checkAttributeStringCoercion(selectedValue[i], 'value');
        }

        var v = '' + selectedValue[i];

        if (v === stringValue) {
          target.push(selectedMarkerAttribute);
          break;
        }
      }
    } else {
      {
        checkAttributeStringCoercion(selectedValue, 'select.value');
      }

      if ('' + selectedValue === stringValue) {
        target.push(selectedMarkerAttribute);
      }
    }
  } else if (selected) {
    target.push(selectedMarkerAttribute);
  }

  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}

function pushInput(target, props, responseState) {
  {
    checkControlledValueProps('input', props);

    if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnDefaultChecked) {
      error('%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);

      didWarnDefaultChecked = true;
    }

    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultInputValue) {
      error('%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', 'A component', props.type);

      didWarnDefaultInputValue = true;
    }
  }

  target.push(startChunkForTag('input'));
  var value = null;
  var defaultValue = null;
  var checked = null;
  var defaultChecked = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('input' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        // eslint-disable-next-line-no-fallthrough

        case 'defaultChecked':
          defaultChecked = propValue;
          break;

        case 'defaultValue':
          defaultValue = propValue;
          break;

        case 'checked':
          checked = propValue;
          break;

        case 'value':
          value = propValue;
          break;

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  if (checked !== null) {
    pushAttribute(target, responseState, 'checked', checked);
  } else if (defaultChecked !== null) {
    pushAttribute(target, responseState, 'checked', defaultChecked);
  }

  if (value !== null) {
    pushAttribute(target, responseState, 'value', value);
  } else if (defaultValue !== null) {
    pushAttribute(target, responseState, 'value', defaultValue);
  }

  target.push(endOfStartTagSelfClosing);
  return null;
}

function pushStartTextArea(target, props, responseState) {
  {
    checkControlledValueProps('textarea', props);

    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnDefaultTextareaValue) {
      error('Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');

      didWarnDefaultTextareaValue = true;
    }
  }

  target.push(startChunkForTag('textarea'));
  var value = null;
  var defaultValue = null;
  var children = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'value':
          value = propValue;
          break;

        case 'defaultValue':
          defaultValue = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          throw new Error('`dangerouslySetInnerHTML` does not make sense on <textarea>.');
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  if (value === null && defaultValue !== null) {
    value = defaultValue;
  }

  target.push(endOfStartTag); // TODO (yungsters): Remove support for children content in <textarea>.

  if (children != null) {
    {
      error('Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
    }

    if (value != null) {
      throw new Error('If you supply `defaultValue` on a <textarea>, do not pass children.');
    }

    if (isArray(children)) {
      if (children.length > 1) {
        throw new Error('<textarea> can only have at most one child.');
      } // TODO: remove the coercion and the DEV check below because it will
      // always be overwritten by the coercion several lines below it. #22309


      {
        checkHtmlStringCoercion(children[0]);
      }

      value = '' + children[0];
    }

    {
      checkHtmlStringCoercion(children);
    }

    value = '' + children;
  }

  if (typeof value === 'string' && value[0] === '\n') {
    // text/html ignores the first character in these tags if it's a newline
    // Prefer to break application/xml over text/html (for now) by adding
    // a newline specifically to get eaten by the parser. (Alternately for
    // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
    // \r is normalized out by HTMLTextAreaElement#value.)
    // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
    // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
    // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
    // See: Parsing of "textarea" "listing" and "pre" elements
    //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
    target.push(leadingNewline);
  } // ToString and push directly instead of recurse over children.
  // We don't really support complex children in the value anyway.
  // This also currently avoids a trailing comment node which breaks textarea.


  if (value !== null) {
    {
      checkAttributeStringCoercion(value, 'value');
    }

    target.push(stringToChunk(encodeHTMLTextNode('' + value)));
  }

  return null;
}

function pushLink(target, props, responseState, textEmbedded) {
  if ( resourcesFromLink(props)) {
    if (textEmbedded) {
      // This link follows text but we aren't writing a tag. while not as efficient as possible we need
      // to be safe and assume text will follow by inserting a textSeparator
      target.push(textSeparator);
    } // We have converted this link exclusively to a resource and no longer
    // need to emit it


    return null;
  }

  return pushLinkImpl(target, props, responseState);
}

function pushLinkImpl(target, props, responseState) {
  var isStylesheet = props.rel === 'stylesheet';
  target.push(startChunkForTag('link'));

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('link' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');

        case 'precedence':
          {
            if ( isStylesheet) {
              // precedence is a reversed property for stylesheets to opt-into resource semantcs
              continue;
            } // intentionally fall through

          }
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTagSelfClosing);
  return null;
}

function pushSelfClosing(target, props, tag, responseState) {
  target.push(startChunkForTag(tag));

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error(tag + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTagSelfClosing);
  return null;
}

function pushStartMenuItem(target, props, responseState) {
  target.push(startChunkForTag('menuitem'));

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('menuitems cannot have `children` nor `dangerouslySetInnerHTML`.');
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTag);
  return null;
}

function pushStartTitle(target, props, responseState) {
  target.push(startChunkForTag('title'));
  var children = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          throw new Error('`dangerouslySetInnerHTML` does not make sense on <title>.');
        // eslint-disable-next-line-no-fallthrough

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTag);

  {
    var child = Array.isArray(children) && children.length < 2 ? children[0] || null : children;

    if (Array.isArray(children) && children.length > 1) {
      error('A title element received an array with more than 1 element as children. ' + 'In browsers title Elements can only have Text Nodes as children. If ' + 'the children being rendered output more than a single text node in aggregate the browser ' + 'will display markup and comments as text in the title and hydration will likely fail and ' + 'fall back to client rendering');
    } else if (child != null && child.$$typeof != null) {
      error('A title element received a React element for children. ' + 'In the browser title Elements can only have Text Nodes as children. If ' + 'the children being rendered output more than a single text node in aggregate the browser ' + 'will display markup and comments as text in the title and hydration will likely fail and ' + 'fall back to client rendering');
    } else if (child != null && typeof child !== 'string' && typeof child !== 'number') {
      error('A title element received a value that was not a string or number for children. ' + 'In the browser title Elements can only have Text Nodes as children. If ' + 'the children being rendered output more than a single text node in aggregate the browser ' + 'will display markup and comments as text in the title and hydration will likely fail and ' + 'fall back to client rendering');
    }
  }

  return children;
}

function pushStartHead(target, preamble, props, tag, responseState) {
  return pushStartGenericElement( preamble , props, tag, responseState);
}

function pushStartHtml(target, preamble, props, tag, responseState, formatContext) {
  target =  preamble ;

  if (formatContext.insertionMode === ROOT_HTML_MODE) {
    // If we're rendering the html tag and we're at the root (i.e. not in foreignObject)
    // then we also emit the DOCTYPE as part of the root content as a convenience for
    // rendering the whole document.
    target.push(DOCTYPE);
  }

  return pushStartGenericElement(target, props, tag, responseState);
}

function pushStartGenericElement(target, props, tag, responseState) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);

  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }

  return children;
}

function pushStartCustomElement(target, props, tag, responseState) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      if ( (typeof propValue === 'function' || typeof propValue === 'object')) {
        // It is normal to render functions and objects on custom elements when
        // client rendering, but when server rendering the output isn't useful,
        // so skip it.
        continue;
      }

      if ( propValue === false) {
        continue;
      }

      if ( propValue === true) {
        propValue = '';
      }

      if ( propKey === 'className') {
        // className gets rendered as class on the client, so it should be
        // rendered as class on the server.
        propKey = 'class';
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;

        case 'style':
          pushStyle(target, responseState, propValue);
          break;

        case 'suppressContentEditableWarning':
        case 'suppressHydrationWarning':
          // Ignored. These are built-in to React on the client.
          break;

        default:
          if (isAttributeNameSafe(propKey) && typeof propValue !== 'function' && typeof propValue !== 'symbol') {
            target.push(attributeSeparator, stringToChunk(propKey), attributeAssign, stringToChunk(escapeTextForBrowser(propValue)), attributeEnd);
          }

          break;
      }
    }
  }

  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}

var leadingNewline = stringToPrecomputedChunk('\n');

function pushStartPreformattedElement(target, props, tag, responseState) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'children':
          children = propValue;
          break;

        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;

        default:
          pushAttribute(target, responseState, propKey, propValue);
          break;
      }
    }
  }

  target.push(endOfStartTag); // text/html ignores the first character in these tags if it's a newline
  // Prefer to break application/xml over text/html (for now) by adding
  // a newline specifically to get eaten by the parser. (Alternately for
  // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
  // \r is normalized out by HTMLTextAreaElement#value.)
  // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
  // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
  // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
  // See: Parsing of "textarea" "listing" and "pre" elements
  //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
  // TODO: This doesn't deal with the case where the child is an array
  // or component that returns a string.

  if (innerHTML != null) {
    if (children != null) {
      throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
    }

    if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
      throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://reactjs.org/link/dangerously-set-inner-html ' + 'for more information.');
    }

    var html = innerHTML.__html;

    if (html !== null && html !== undefined) {
      if (typeof html === 'string' && html.length > 0 && html[0] === '\n') {
        target.push(leadingNewline, stringToChunk(html));
      } else {
        {
          checkHtmlStringCoercion(html);
        }

        target.push(stringToChunk('' + html));
      }
    }
  }

  if (typeof children === 'string' && children[0] === '\n') {
    target.push(leadingNewline);
  }

  return children;
} // We accept any tag to be rendered but since this gets injected into arbitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name


var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset

var validatedTagCache = new Map();

function startChunkForTag(tag) {
  var tagStartChunk = validatedTagCache.get(tag);

  if (tagStartChunk === undefined) {
    if (!VALID_TAG_REGEX.test(tag)) {
      throw new Error("Invalid tag: " + tag);
    }

    tagStartChunk = stringToPrecomputedChunk('<' + tag);
    validatedTagCache.set(tag, tagStartChunk);
  }

  return tagStartChunk;
}

var DOCTYPE = stringToPrecomputedChunk('<!DOCTYPE html>');
function pushStartInstance(target, preamble, type, props, responseState, formatContext, textEmbedded) {
  {
    validateProperties(type, props);
    validateProperties$1(type, props);
    validateProperties$2(type, props, null);

    if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
      error('A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.');
    }

    if (formatContext.insertionMode !== SVG_MODE && formatContext.insertionMode !== MATHML_MODE) {
      if (type.indexOf('-') === -1 && typeof props.is !== 'string' && type.toLowerCase() !== type) {
        error('<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', type);
      }
    }
  }

  switch (type) {
    // Special tags
    case 'select':
      return pushStartSelect(target, props, responseState);

    case 'option':
      return pushStartOption(target, props, responseState, formatContext);

    case 'textarea':
      return pushStartTextArea(target, props, responseState);

    case 'input':
      return pushInput(target, props, responseState);

    case 'menuitem':
      return pushStartMenuItem(target, props, responseState);

    case 'title':
      return pushStartTitle(target, props, responseState);

    case 'link':
      return pushLink(target, props, responseState, textEmbedded);
    // Newline eating tags

    case 'listing':
    case 'pre':
      {
        return pushStartPreformattedElement(target, props, type, responseState);
      }
    // Omitted close tags

    case 'area':
    case 'base':
    case 'br':
    case 'col':
    case 'embed':
    case 'hr':
    case 'img':
    case 'keygen':
    case 'meta':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr':
      {
        return pushSelfClosing(target, props, type, responseState);
      }
    // These are reserved SVG and MathML elements, that are never custom elements.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts

    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      {
        return pushStartGenericElement(target, props, type, responseState);
      }
    // Preamble start tags

    case 'head':
      return pushStartHead(target, preamble, props, type, responseState);

    case 'html':
      {
        return pushStartHtml(target, preamble, props, type, responseState, formatContext);
      }

    default:
      {
        if (type.indexOf('-') === -1 && typeof props.is !== 'string') {
          // Generic element
          return pushStartGenericElement(target, props, type, responseState);
        } else {
          // Custom element
          return pushStartCustomElement(target, props, type, responseState);
        }
      }
  }
}
var endTag1 = stringToPrecomputedChunk('</');
var endTag2 = stringToPrecomputedChunk('>');
function pushEndInstance(target, postamble, type, props) {
  switch (type) {
    // Omitted close tags
    // TODO: Instead of repeating this switch we could try to pass a flag from above.
    // That would require returning a tuple. Which might be ok if it gets inlined.
    case 'area':
    case 'base':
    case 'br':
    case 'col':
    case 'embed':
    case 'hr':
    case 'img':
    case 'input':
    case 'keygen':
    case 'link':
    case 'meta':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr':
      {
        // No close tag needed.
        return;
      }
    // Postamble end tags

    case 'body':
      {
        {
          postamble.unshift(endTag1, stringToChunk(type), endTag2);
          return;
        }
      }

    case 'html':
      {
        postamble.push(endTag1, stringToChunk(type), endTag2);
        return;
      }
  }

  target.push(endTag1, stringToChunk(type), endTag2);
}
function writeCompletedRoot(destination, responseState) {
  var bootstrapChunks = responseState.bootstrapChunks;
  var i = 0;

  for (; i < bootstrapChunks.length - 1; i++) {
    writeChunk(destination, bootstrapChunks[i]);
  }

  if (i < bootstrapChunks.length) {
    return writeChunkAndReturn(destination, bootstrapChunks[i]);
  }

  return true;
} // Structural Nodes
// A placeholder is a node inside a hidden partial tree that can be filled in later, but before
// display. It's never visible to users. We use the template tag because it can be used in every
// type of parent. <script> tags also work in every other tag except <colgroup>.

var placeholder1 = stringToPrecomputedChunk('<template id="');
var placeholder2 = stringToPrecomputedChunk('"></template>');
function writePlaceholder(destination, responseState, id) {
  writeChunk(destination, placeholder1);
  writeChunk(destination, responseState.placeholderPrefix);
  var formattedID = stringToChunk(id.toString(16));
  writeChunk(destination, formattedID);
  return writeChunkAndReturn(destination, placeholder2);
} // Suspense boundaries are encoded as comments.

var startCompletedSuspenseBoundary = stringToPrecomputedChunk('<!--$-->');
var startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="');
var startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>');
var startClientRenderedSuspenseBoundary = stringToPrecomputedChunk('<!--$!-->');
var endSuspenseBoundary = stringToPrecomputedChunk('<!--/$-->');
var clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk('<template');
var clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"');
var clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
var clientRenderedSuspenseBoundaryError1B = stringToPrecomputedChunk(' data-msg="');
var clientRenderedSuspenseBoundaryError1C = stringToPrecomputedChunk(' data-stck="');
var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk('></template>');
function writeStartCompletedSuspenseBoundary(destination, responseState) {
  return writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
}
function writeStartPendingSuspenseBoundary(destination, responseState, id) {
  writeChunk(destination, startPendingSuspenseBoundary1);

  if (id === null) {
    throw new Error('An ID must have been assigned before we can complete the boundary.');
  }

  writeChunk(destination, id);
  return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
}
function writeStartClientRenderedSuspenseBoundary(destination, responseState, errorDigest, errorMesssage, errorComponentStack) {
  var result;
  result = writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
  writeChunk(destination, clientRenderedSuspenseBoundaryError1);

  if (errorDigest) {
    writeChunk(destination, clientRenderedSuspenseBoundaryError1A);
    writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest)));
    writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
  }

  {
    if (errorMesssage) {
      writeChunk(destination, clientRenderedSuspenseBoundaryError1B);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorMesssage)));
      writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }

    if (errorComponentStack) {
      writeChunk(destination, clientRenderedSuspenseBoundaryError1C);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorComponentStack)));
      writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }
  }

  result = writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
  return result;
}
function writeEndCompletedSuspenseBoundary(destination, responseState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function writeEndPendingSuspenseBoundary(destination, responseState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function writeEndClientRenderedSuspenseBoundary(destination, responseState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="');
var startSegmentHTML2 = stringToPrecomputedChunk('">');
var endSegmentHTML = stringToPrecomputedChunk('</div>');
var startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="');
var startSegmentSVG2 = stringToPrecomputedChunk('">');
var endSegmentSVG = stringToPrecomputedChunk('</svg>');
var startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="');
var startSegmentMathML2 = stringToPrecomputedChunk('">');
var endSegmentMathML = stringToPrecomputedChunk('</math>');
var startSegmentTable = stringToPrecomputedChunk('<table hidden id="');
var startSegmentTable2 = stringToPrecomputedChunk('">');
var endSegmentTable = stringToPrecomputedChunk('</table>');
var startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="');
var startSegmentTableBody2 = stringToPrecomputedChunk('">');
var endSegmentTableBody = stringToPrecomputedChunk('</tbody></table>');
var startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="');
var startSegmentTableRow2 = stringToPrecomputedChunk('">');
var endSegmentTableRow = stringToPrecomputedChunk('</tr></table>');
var startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="');
var startSegmentColGroup2 = stringToPrecomputedChunk('">');
var endSegmentColGroup = stringToPrecomputedChunk('</colgroup></table>');
function writeStartSegment(destination, responseState, formatContext, id) {
  switch (formatContext.insertionMode) {
    case ROOT_HTML_MODE:
    case HTML_MODE:
      {
        writeChunk(destination, startSegmentHTML);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentHTML2);
      }

    case SVG_MODE:
      {
        writeChunk(destination, startSegmentSVG);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentSVG2);
      }

    case MATHML_MODE:
      {
        writeChunk(destination, startSegmentMathML);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentMathML2);
      }

    case HTML_TABLE_MODE:
      {
        writeChunk(destination, startSegmentTable);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTable2);
      }
    // TODO: For the rest of these, there will be extra wrapper nodes that never
    // get deleted from the document. We need to delete the table too as part
    // of the injected scripts. They are invisible though so it's not too terrible
    // and it's kind of an edge case to suspend in a table. Totally supported though.

    case HTML_TABLE_BODY_MODE:
      {
        writeChunk(destination, startSegmentTableBody);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTableBody2);
      }

    case HTML_TABLE_ROW_MODE:
      {
        writeChunk(destination, startSegmentTableRow);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTableRow2);
      }

    case HTML_COLGROUP_MODE:
      {
        writeChunk(destination, startSegmentColGroup);
        writeChunk(destination, responseState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentColGroup2);
      }

    default:
      {
        throw new Error('Unknown insertion mode. This is a bug in React.');
      }
  }
}
function writeEndSegment(destination, formatContext) {
  switch (formatContext.insertionMode) {
    case ROOT_HTML_MODE:
    case HTML_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentHTML);
      }

    case SVG_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentSVG);
      }

    case MATHML_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentMathML);
      }

    case HTML_TABLE_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTable);
      }

    case HTML_TABLE_BODY_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTableBody);
      }

    case HTML_TABLE_ROW_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTableRow);
      }

    case HTML_COLGROUP_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentColGroup);
      }

    default:
      {
        throw new Error('Unknown insertion mode. This is a bug in React.');
      }
  }
} // Instruction Set
// The following code is the source scripts that we then minify and inline below,
// with renamed function names that we hope don't collide:
// const COMMENT_NODE = 8;
// const SUSPENSE_START_DATA = '$';
// const SUSPENSE_END_DATA = '/$';
// const SUSPENSE_PENDING_START_DATA = '$?';
// const SUSPENSE_FALLBACK_START_DATA = '$!';
// const LOADED = 'l';
// const ERRORED = 'e';
// function clientRenderBoundary(suspenseBoundaryID, errorDigest, errorMsg, errorComponentStack) {
//   // Find the fallback's first element.
//   const suspenseIdNode = document.getElementById(suspenseBoundaryID);
//   if (!suspenseIdNode) {
//     // The user must have already navigated away from this tree.
//     // E.g. because the parent was hydrated.
//     return;
//   }
//   // Find the boundary around the fallback. This is always the previous node.
//   const suspenseNode = suspenseIdNode.previousSibling;
//   // Tag it to be client rendered.
//   suspenseNode.data = SUSPENSE_FALLBACK_START_DATA;
//   // assign error metadata to first sibling
//   let dataset = suspenseIdNode.dataset;
//   if (errorDigest) dataset.dgst = errorDigest;
//   if (errorMsg) dataset.msg = errorMsg;
//   if (errorComponentStack) dataset.stck = errorComponentStack;
//   // Tell React to retry it if the parent already hydrated.
//   if (suspenseNode._reactRetry) {
//     suspenseNode._reactRetry();
//   }
// }
// resourceMap = new Map();
// function completeBoundaryWithStyles(suspenseBoundaryID, contentID, styles) {
//   const precedences = new Map();
//   const thisDocument = document;
//   let lastResource, node;
//   // Seed the precedence list with existing resources
//   let nodes = thisDocument.querySelectorAll('link[data-rprec]');
//   for (let i = 0;node = nodes[i++];) {
//     precedences.set(node.dataset.rprec, lastResource = node);
//   }
//   let i = 0;
//   let dependencies = [];
//   let style, href, precedence, attr, loadingState, resourceEl;
//   function setStatus(s) {
//     this.s = s;
//   }
//   while (style = styles[i++]) {
//     let j = 0;
//     href = style[j++];
//     // We check if this resource is already in our resourceMap and reuse it if so.
//     // If it is already loaded we don't return it as a depenendency since there is nothing
//     // to wait for
//     loadingState = resourceMap.get(href);
//     if (loadingState) {
//       if (loadingState.s !== 'l') {
//         dependencies.push(loadingState);
//       }
//       continue;
//     }
//     // We construct our new resource element, looping over remaining attributes if any
//     // setting them to the Element.
//     resourceEl = thisDocument.createElement("link");
//     resourceEl.href = href;
//     resourceEl.rel = 'stylesheet';
//     resourceEl.dataset.rprec = precedence = style[j++];
//     while(attr = style[j++]) {
//       resourceEl.setAttribute(attr, style[j++]);
//     }
//     // We stash a pending promise in our map by href which will resolve or reject
//     // when the underlying resource loads or errors. We add it to the dependencies
//     // array to be returned.
//     loadingState = resourceEl._p = new Promise((re, rj) => {
//       resourceEl.onload = re;
//       resourceEl.onerror = rj;
//     })
//     loadingState.then(
//       setStatus.bind(loadingState, LOADED),
//       setStatus.bind(loadingState, ERRORED)
//     );
//     resourceMap.set(href, loadingState);
//     dependencies.push(loadingState);
//     // The prior style resource is the last one placed at a given
//     // precedence or the last resource itself which may be null.
//     // We grab this value and then update the last resource for this
//     // precedence to be the inserted element, updating the lastResource
//     // pointer if needed.
//     let prior = precedences.get(precedence) || lastResource;
//     if (prior === lastResource) {
//       lastResource = resourceEl
//     }
//     precedences.set(precedence, resourceEl)
//     // Finally, we insert the newly constructed instance at an appropriate location
//     // in the Document.
//     if (prior) {
//       prior.parentNode.insertBefore(resourceEl, prior.nextSibling);
//     } else {
//       let head = thisDocument.head;
//       head.insertBefore(resourceEl, head.firstChild);
//     }
//   }
//   Promise.all(dependencies).then(
//     completeBoundary.bind(null, suspenseBoundaryID, contentID, ''),
//     completeBoundary.bind(null, suspenseBoundaryID, contentID, "Resource failed to load")
//   );
// }
// function completeBoundary(suspenseBoundaryID, contentID, errorDigest) {
//   const contentNode = document.getElementById(contentID);
//   // We'll detach the content node so that regardless of what happens next we don't leave in the tree.
//   // This might also help by not causing recalcing each time we move a child from here to the target.
//   contentNode.parentNode.removeChild(contentNode);
//   // Find the fallback's first element.
//   const suspenseIdNode = document.getElementById(suspenseBoundaryID);
//   if (!suspenseIdNode) {
//     // The user must have already navigated away from this tree.
//     // E.g. because the parent was hydrated. That's fine there's nothing to do
//     // but we have to make sure that we already deleted the container node.
//     return;
//   }
//   // Find the boundary around the fallback. This is always the previous node.
//   const suspenseNode = suspenseIdNode.previousSibling;
//   if (!errorDigest) {
//     // Clear all the existing children. This is complicated because
//     // there can be embedded Suspense boundaries in the fallback.
//     // This is similar to clearSuspenseBoundary in ReactDOMHostConfig.
//     // TODO: We could avoid this if we never emitted suspense boundaries in fallback trees.
//     // They never hydrate anyway. However, currently we support incrementally loading the fallback.
//     const parentInstance = suspenseNode.parentNode;
//     let node = suspenseNode.nextSibling;
//     let depth = 0;
//     do {
//       if (node && node.nodeType === COMMENT_NODE) {
//         const data = node.data;
//         if (data === SUSPENSE_END_DATA) {
//           if (depth === 0) {
//             break;
//           } else {
//             depth--;
//           }
//         } else if (
//           data === SUSPENSE_START_DATA ||
//           data === SUSPENSE_PENDING_START_DATA ||
//           data === SUSPENSE_FALLBACK_START_DATA
//         ) {
//           depth++;
//         }
//       }
//       const nextNode = node.nextSibling;
//       parentInstance.removeChild(node);
//       node = nextNode;
//     } while (node);
//     const endOfBoundary = node;
//     // Insert all the children from the contentNode between the start and end of suspense boundary.
//     while (contentNode.firstChild) {
//       parentInstance.insertBefore(contentNode.firstChild, endOfBoundary);
//     }
//     suspenseNode.data = SUSPENSE_START_DATA;
//   } else {
//     suspenseNode.data = SUSPENSE_FALLBACK_START_DATA;
//     suspenseIdNode.setAttribute('data-dgst', errorDigest)
//   }
//   if (suspenseNode._reactRetry) {
//     suspenseNode._reactRetry();
//   }
// }
// function completeSegment(containerID, placeholderID) {
//   const segmentContainer = document.getElementById(containerID);
//   const placeholderNode = document.getElementById(placeholderID);
//   // We always expect both nodes to exist here because, while we might
//   // have navigated away from the main tree, we still expect the detached
//   // tree to exist.
//   segmentContainer.parentNode.removeChild(segmentContainer);
//   while (segmentContainer.firstChild) {
//     placeholderNode.parentNode.insertBefore(
//       segmentContainer.firstChild,
//       placeholderNode,
//     );
//   }
//   placeholderNode.parentNode.removeChild(placeholderNode);
// }

var completeSegmentFunction = 'function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)}';
var completeBoundaryFunction = 'function $RC(b,c,d){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(d)b.data="$!",a.setAttribute("data-dgst",d);else{d=b.parentNode;a=b.nextSibling;var e=0;do{if(a&&a.nodeType===8){var h=a.data;if(h==="/$")if(0===e)break;else e--;else h!=="$"&&h!=="$?"&&h!=="$!"||e++}h=a.nextSibling;d.removeChild(a);a=h}while(a);for(;c.firstChild;)d.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}}';
var styleInsertionFunction = '$RM=new Map;function $RR(p,q,t){function r(l){this.s=l}for(var m=new Map,n=document,g,e,f=n.querySelectorAll("link[data-rprec]"),d=0;e=f[d++];)m.set(e.dataset.rprec,g=e);e=0;f=[];for(var c,h,b,a;c=t[e++];){var k=0;h=c[k++];if(b=$RM.get(h))"l"!==b.s&&f.push(b);else{a=n.createElement("link");a.href=h;a.rel="stylesheet";for(a.dataset.rprec=d=c[k++];b=c[k++];)a.setAttribute(b,c[k++]);b=a._p=new Promise(function(l,u){a.onload=l;a.onerror=u});b.then(r.bind(b,"l"),r.bind(b,"e"));$RM.set(h,b);f.push(b);c=m.get(d)||g;c===g&&(g=a);m.set(d,a);c?c.parentNode.insertBefore(a,c.nextSibling):(d=n.head,d.insertBefore(a,d.firstChild))}}Promise.all(f).then($RC.bind(null,p,q,""),$RC.bind(null,p,q,"Resource failed to load"))}';
var clientRenderFunction = 'function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())}';
var completeSegmentScript1Full = stringToPrecomputedChunk(completeSegmentFunction + ';$RS("');
var completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("');
var completeSegmentScript2 = stringToPrecomputedChunk('","');
var completeSegmentScript3 = stringToPrecomputedChunk('")</script>');
function writeCompletedSegmentInstruction(destination, responseState, contentSegmentID) {
  writeChunk(destination, responseState.startInlineScript);

  if (!responseState.sentCompleteSegmentFunction) {
    // The first time we write this, we'll need to include the full implementation.
    responseState.sentCompleteSegmentFunction = true;
    writeChunk(destination, completeSegmentScript1Full);
  } else {
    // Future calls can just reuse the same function.
    writeChunk(destination, completeSegmentScript1Partial);
  }

  writeChunk(destination, responseState.segmentPrefix);
  var formattedID = stringToChunk(contentSegmentID.toString(16));
  writeChunk(destination, formattedID);
  writeChunk(destination, completeSegmentScript2);
  writeChunk(destination, responseState.placeholderPrefix);
  writeChunk(destination, formattedID);
  return writeChunkAndReturn(destination, completeSegmentScript3);
}
var completeBoundaryScript1Full = stringToPrecomputedChunk(completeBoundaryFunction + ';$RC("');
var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("');
var completeBoundaryWithStylesScript1FullBoth = stringToPrecomputedChunk(completeBoundaryFunction + ';' + styleInsertionFunction + ';$RR("');
var completeBoundaryWithStylesScript1FullPartial = stringToPrecomputedChunk(styleInsertionFunction + ';$RR("');
var completeBoundaryWithStylesScript1Partial = stringToPrecomputedChunk('$RR("');
var completeBoundaryScript2 = stringToPrecomputedChunk('","');
var completeBoundaryScript2a = stringToPrecomputedChunk('",');
var completeBoundaryScript3 = stringToPrecomputedChunk('"');
var completeBoundaryScript4 = stringToPrecomputedChunk(')</script>');
function writeCompletedBoundaryInstruction(destination, responseState, boundaryID, contentSegmentID, boundaryResources) {
  var hasStyleDependencies;

  {
    hasStyleDependencies = hasStyleResourceDependencies(boundaryResources);
  }

  writeChunk(destination, responseState.startInlineScript);

  if ( hasStyleDependencies) {
    if (!responseState.sentCompleteBoundaryFunction) {
      responseState.sentCompleteBoundaryFunction = true;
      responseState.sentStyleInsertionFunction = true;
      writeChunk(destination, completeBoundaryWithStylesScript1FullBoth);
    } else if (!responseState.sentStyleInsertionFunction) {
      responseState.sentStyleInsertionFunction = true;
      writeChunk(destination, completeBoundaryWithStylesScript1FullPartial);
    } else {
      writeChunk(destination, completeBoundaryWithStylesScript1Partial);
    }
  } else {
    if (!responseState.sentCompleteBoundaryFunction) {
      responseState.sentCompleteBoundaryFunction = true;
      writeChunk(destination, completeBoundaryScript1Full);
    } else {
      writeChunk(destination, completeBoundaryScript1Partial);
    }
  }

  if (boundaryID === null) {
    throw new Error('An ID must have been assigned before we can complete the boundary.');
  }

  var formattedContentID = stringToChunk(contentSegmentID.toString(16));
  writeChunk(destination, boundaryID);
  writeChunk(destination, completeBoundaryScript2);
  writeChunk(destination, responseState.segmentPrefix);
  writeChunk(destination, formattedContentID);

  if ( hasStyleDependencies) {
    writeChunk(destination, completeBoundaryScript2a);
    writeStyleResourceDependencies(destination, boundaryResources);
  } else {
    writeChunk(destination, completeBoundaryScript3);
  }

  return writeChunkAndReturn(destination, completeBoundaryScript4);
}
var clientRenderScript1Full = stringToPrecomputedChunk(clientRenderFunction + ';$RX("');
var clientRenderScript1Partial = stringToPrecomputedChunk('$RX("');
var clientRenderScript1A = stringToPrecomputedChunk('"');
var clientRenderScript2 = stringToPrecomputedChunk(')</script>');
var clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(',');
function writeClientRenderBoundaryInstruction(destination, responseState, boundaryID, errorDigest, errorMessage, errorComponentStack) {
  writeChunk(destination, responseState.startInlineScript);

  if (!responseState.sentClientRenderFunction) {
    // The first time we write this, we'll need to include the full implementation.
    responseState.sentClientRenderFunction = true;
    writeChunk(destination, clientRenderScript1Full);
  } else {
    // Future calls can just reuse the same function.
    writeChunk(destination, clientRenderScript1Partial);
  }

  if (boundaryID === null) {
    throw new Error('An ID must have been assigned before we can complete the boundary.');
  }

  writeChunk(destination, boundaryID);
  writeChunk(destination, clientRenderScript1A);

  if (errorDigest || errorMessage || errorComponentStack) {
    writeChunk(destination, clientRenderErrorScriptArgInterstitial);
    writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || '')));
  }

  if (errorMessage || errorComponentStack) {
    writeChunk(destination, clientRenderErrorScriptArgInterstitial);
    writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorMessage || '')));
  }

  if (errorComponentStack) {
    writeChunk(destination, clientRenderErrorScriptArgInterstitial);
    writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorComponentStack)));
  }

  return writeChunkAndReturn(destination, clientRenderScript2);
}
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;

function escapeJSStringsForInstructionScripts(input) {
  var escaped = JSON.stringify(input);
  return escaped.replace(regexForJSStringsInInstructionScripts, function (match) {
    switch (match) {
      // santizing breaking out of strings and script tags
      case '<':
        return "\\u003c";

      case "\u2028":
        return "\\u2028";

      case "\u2029":
        return "\\u2029";

      default:
        {
          // eslint-disable-next-line react-internal/prod-error-codes
          throw new Error('escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
        }
    }
  });
}

var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;

function escapeJSObjectForInstructionScripts(input) {
  var escaped = JSON.stringify(input);
  return escaped.replace(regexForJSStringsInScripts, function (match) {
    switch (match) {
      // santizing breaking out of strings and script tags
      case '&':
        return "\\u0026";

      case '>':
        return "\\u003e";

      case '<':
        return "\\u003c";

      case "\u2028":
        return "\\u2028";

      case "\u2029":
        return "\\u2029";

      default:
        {
          // eslint-disable-next-line react-internal/prod-error-codes
          throw new Error('escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
        }
    }
  });
}

function writeInitialResources(destination, resources, responseState) {
  var explicitPreloadsTarget = [];
  var remainingTarget = [];
  var precedences = resources.precedences,
      explicitPreloads = resources.explicitPreloads,
      implicitPreloads = resources.implicitPreloads; // Flush stylesheets first by earliest precedence

  precedences.forEach(function (precedenceResources) {
    precedenceResources.forEach(function (resource) {
      // resources should not already be flushed so we elide this check
      pushLinkImpl(remainingTarget, resource.props, responseState);
      resource.flushed = true;
      resource.inShell = true;
      resource.hint.flushed = true;
    });
  });
  explicitPreloads.forEach(function (resource) {
    if (!resource.flushed) {
      pushLinkImpl(explicitPreloadsTarget, resource.props, responseState);
      resource.flushed = true;
    }
  });
  explicitPreloads.clear();
  implicitPreloads.forEach(function (resource) {
    if (!resource.flushed) {
      pushLinkImpl(remainingTarget, resource.props, responseState);
      resource.flushed = true;
    }
  });
  implicitPreloads.clear();
  var i;
  var r = true;

  for (i = 0; i < explicitPreloadsTarget.length - 1; i++) {
    writeChunk(destination, explicitPreloadsTarget[i]);
  }

  if (i < explicitPreloadsTarget.length) {
    r = writeChunkAndReturn(destination, explicitPreloadsTarget[i]);
  }

  for (i = 0; i < remainingTarget.length - 1; i++) {
    writeChunk(destination, remainingTarget[i]);
  }

  if (i < remainingTarget.length) {
    r = writeChunkAndReturn(destination, remainingTarget[i]);
  }

  return r;
}
function writeImmediateResources(destination, resources, responseState) {
  var explicitPreloads = resources.explicitPreloads,
      implicitPreloads = resources.implicitPreloads;
  var target = [];
  explicitPreloads.forEach(function (resource) {
    if (!resource.flushed) {
      pushLinkImpl(target, resource.props, responseState);
      resource.flushed = true;
    }
  });
  explicitPreloads.clear();
  implicitPreloads.forEach(function (resource) {
    if (!resource.flushed) {
      pushLinkImpl(target, resource.props, responseState);
      resource.flushed = true;
    }
  });
  implicitPreloads.clear();
  var i = 0;

  for (; i < target.length - 1; i++) {
    writeChunk(destination, target[i]);
  }

  if (i < target.length) {
    return writeChunkAndReturn(destination, target[i]);
  }

  return false;
}

function hasStyleResourceDependencies(boundaryResources) {
  var iter = boundaryResources.values(); // At the moment boundaries only accumulate style resources
  // so we assume the type is correct and don't check it

  while (true) {
    var _iter$next = iter.next(),
        resource = _iter$next.value;

    if (!resource) break; // If every style Resource flushed in the shell we do not need to send
    // any dependencies

    if (!resource.inShell) {
      return true;
    }
  }

  return false;
}

var arrayFirstOpenBracket = stringToPrecomputedChunk('[');
var arraySubsequentOpenBracket = stringToPrecomputedChunk(',[');
var arrayInterstitial = stringToPrecomputedChunk(',');
var arrayCloseBracket = stringToPrecomputedChunk(']');

function writeStyleResourceDependencies(destination, boundaryResources) {
  writeChunk(destination, arrayFirstOpenBracket);
  var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
  boundaryResources.forEach(function (resource) {
    if (resource.inShell) ; else if (resource.flushed) {
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependencyHrefOnly(destination, resource.href);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
    } else {
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependency(destination, resource.href, resource.precedence, resource.props);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
      resource.flushed = true;
      resource.hint.flushed = true;
    }
  });
  writeChunk(destination, arrayCloseBracket);
}

function writeStyleResourceDependencyHrefOnly(destination, href) {
  // We should actually enforce this earlier when the resource is created but for
  // now we make sure we are actually dealing with a string here.
  {
    checkAttributeStringCoercion(href, 'href');
  }

  var coercedHref = '' + href;
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedHref)));
}

function writeStyleResourceDependency(destination, href, precedence, props) {
  {
    checkAttributeStringCoercion(href, 'href');
  }

  var coercedHref = '' + href;
  sanitizeURL(coercedHref);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedHref)));

  {
    checkAttributeStringCoercion(precedence, 'precedence');
  }

  var coercedPrecedence = '' + precedence;
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedPrecedence)));

  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];

      if (propValue == null) {
        continue;
      }

      switch (propKey) {
        case 'href':
        case 'rel':
        case 'precedence':
        case 'data-rprec':
          {
            break;
          }

        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('link' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        // eslint-disable-next-line-no-fallthrough

        default:
          writeStyleResourceAttribute(destination, propKey, propValue);
          break;
      }
    }
  }

  return null;
}

function writeStyleResourceAttribute(destination, name, value) {
  var attributeName = name.toLowerCase();
  var attributeValue;

  switch (typeof value) {
    case 'function':
    case 'symbol':
      return;
  }

  switch (name) {
    // Reserved names
    case 'innerHTML':
    case 'dangerouslySetInnerHTML':
    case 'suppressContentEditableWarning':
    case 'suppressHydrationWarning':
    case 'style':
      // Ignored
      return;
    // Attribute renames

    case 'className':
      attributeName = 'class';
      break;
    // Booleans

    case 'hidden':
      if (value === false) {
        return;
      }

      attributeValue = '';
      break;
    // Santized URLs

    case 'src':
    case 'href':
      {
        {
          checkAttributeStringCoercion(value, attributeName);
        }

        attributeValue = '' + value;
        sanitizeURL(attributeValue);
        break;
      }

    default:
      {
        if (!isAttributeNameSafe(name)) {
          return;
        }
      }
  }

  if ( // shouldIgnoreAttribute
  // We have already filtered out null/undefined and reserved words.
  name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
    return;
  }

  {
    checkAttributeStringCoercion(value, attributeName);
  }

  attributeValue = '' + value;
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeName)));
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeValue)));
}

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_SCOPE_TYPE = Symbol.for('react.scope');
var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for('react.debug_trace_mode');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
var REACT_LEGACY_HIDDEN_TYPE = Symbol.for('react.legacy_hidden');
var REACT_CACHE_TYPE = Symbol.for('react.cache');
var REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for('react.default_value');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
} // Keep in sync with react-reconciler/getComponentNameFromFiber


function getContextName(type) {
  return type.displayName || 'Context';
} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  {
    if (typeof type.tag === 'number') {
      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';

    case REACT_CACHE_TYPE:
      {
        return 'Cache';
      }

  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context) + '.Consumer';

      case REACT_PROVIDER_TYPE:
        var provider = type;
        return getContextName(provider._context) + '.Provider';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }

      case REACT_SERVER_CONTEXT_TYPE:
        {
          var context2 = type;
          return (context2.displayName || context2._globalName) + '.Provider';
        }

      // eslint-disable-next-line no-fallthrough
    }
  }

  return null;
}

// Helpers to patch console.logs to avoid logging during side-effect free
// replaying on render function. This currently only patches the object
// lazily which won't cover if the log function was extracted eagerly.
// We could also eagerly patch the method.
var disabledDepth = 0;
var prevLog;
var prevInfo;
var prevWarn;
var prevError;
var prevGroup;
var prevGroupCollapsed;
var prevGroupEnd;

function disabledLog() {}

disabledLog.__reactDisabledLog = true;
function disableLogs() {
  {
    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      prevLog = console.log;
      prevInfo = console.info;
      prevWarn = console.warn;
      prevError = console.error;
      prevGroup = console.group;
      prevGroupCollapsed = console.groupCollapsed;
      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

      var props = {
        configurable: true,
        enumerable: true,
        value: disabledLog,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        info: props,
        log: props,
        warn: props,
        error: props,
        group: props,
        groupCollapsed: props,
        groupEnd: props
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    disabledDepth++;
  }
}
function reenableLogs() {
  {
    disabledDepth--;

    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      var props = {
        configurable: true,
        enumerable: true,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        log: assign({}, props, {
          value: prevLog
        }),
        info: assign({}, props, {
          value: prevInfo
        }),
        warn: assign({}, props, {
          value: prevWarn
        }),
        error: assign({}, props, {
          value: prevError
        }),
        group: assign({}, props, {
          value: prevGroup
        }),
        groupCollapsed: assign({}, props, {
          value: prevGroupCollapsed
        }),
        groupEnd: assign({}, props, {
          value: prevGroupEnd
        })
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    if (disabledDepth < 0) {
      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
    }
  }
}

var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
var prefix;
function describeBuiltInComponentFrame(name, source, ownerFn) {
  {
    if (prefix === undefined) {
      // Extract the VM specific prefix used by each line.
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || '';
      }
    } // We use the prefix to ensure our stacks line up with native stack frames.


    return '\n' + prefix + name;
  }
}
var reentry = false;
var componentFrameCache;

{
  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
  componentFrameCache = new PossiblyWeakMap();
}

function describeNativeComponentFrame(fn, construct) {
  // If something asked for a stack inside a fake render, it should get ignored.
  if ( !fn || reentry) {
    return '';
  }

  {
    var frame = componentFrameCache.get(fn);

    if (frame !== undefined) {
      return frame;
    }
  }

  var control;
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

  Error.prepareStackTrace = undefined;
  var previousDispatcher;

  {
    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
    // for warnings.

    ReactCurrentDispatcher.current = null;
    disableLogs();
  }

  try {
    // This should throw.
    if (construct) {
      // Something should be setting the props in the constructor.
      var Fake = function () {
        throw Error();
      }; // $FlowFixMe


      Object.defineProperty(Fake.prototype, 'props', {
        set: function () {
          // We use a throwing setter instead of frozen or non-writable props
          // because that won't throw in a non-strict mode function.
          throw Error();
        }
      });

      if (typeof Reflect === 'object' && Reflect.construct) {
        // We construct a different control for this case to include any extra
        // frames added by the construct call.
        try {
          Reflect.construct(Fake, []);
        } catch (x) {
          control = x;
        }

        Reflect.construct(fn, [], Fake);
      } else {
        try {
          Fake.call();
        } catch (x) {
          control = x;
        } // $FlowFixMe[prop-missing] found when upgrading Flow


        fn.call(Fake.prototype);
      }
    } else {
      try {
        throw Error();
      } catch (x) {
        control = x;
      } // TODO(luna): This will currently only throw if the function component
      // tries to access React/ReactDOM/props. We should probably make this throw
      // in simple components too


      fn();
    }
  } catch (sample) {
    // This is inlined manually because closure doesn't do it for us.
    if (sample && control && typeof sample.stack === 'string') {
      // This extracts the first frame from the sample that isn't also in the control.
      // Skipping one frame that we assume is the frame that calls the two.
      var sampleLines = sample.stack.split('\n');
      var controlLines = control.stack.split('\n');
      var s = sampleLines.length - 1;
      var c = controlLines.length - 1;

      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
        // We expect at least one stack frame to be shared.
        // Typically this will be the root most one. However, stack frames may be
        // cut off due to maximum stack limits. In this case, one maybe cut off
        // earlier than the other. We assume that the sample is longer or the same
        // and there for cut off earlier. So we should find the root most frame in
        // the sample somewhere in the control.
        c--;
      }

      for (; s >= 1 && c >= 0; s--, c--) {
        // Next we find the first one that isn't the same which should be the
        // frame that called our sample function and the control.
        if (sampleLines[s] !== controlLines[c]) {
          // In V8, the first line is describing the message but other VMs don't.
          // If we're about to return the first line, and the control is also on the same
          // line, that's a pretty good indicator that our sample threw at same line as
          // the control. I.e. before we entered the sample frame. So we ignore this result.
          // This can happen if you passed a class to function component, or non-function.
          if (s !== 1 || c !== 1) {
            do {
              s--;
              c--; // We may still have similar intermediate frames from the construct call.
              // The next one that isn't the same should be our match though.

              if (c < 0 || sampleLines[s] !== controlLines[c]) {
                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                // but we have a user-provided "displayName"
                // splice it in to make the stack more readable.


                if (fn.displayName && _frame.includes('<anonymous>')) {
                  _frame = _frame.replace('<anonymous>', fn.displayName);
                }

                {
                  if (typeof fn === 'function') {
                    componentFrameCache.set(fn, _frame);
                  }
                } // Return the line we found.


                return _frame;
              }
            } while (s >= 1 && c >= 0);
          }

          break;
        }
      }
    }
  } finally {
    reentry = false;

    {
      ReactCurrentDispatcher.current = previousDispatcher;
      reenableLogs();
    }

    Error.prepareStackTrace = previousPrepareStackTrace;
  } // Fallback to just using the name if we couldn't make it throw.


  var name = fn ? fn.displayName || fn.name : '';
  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

  {
    if (typeof fn === 'function') {
      componentFrameCache.set(fn, syntheticFrame);
    }
  }

  return syntheticFrame;
}

function describeClassComponentFrame(ctor, source, ownerFn) {
  {
    return describeNativeComponentFrame(ctor, true);
  }
}
function describeFunctionComponentFrame(fn, source, ownerFn) {
  {
    return describeNativeComponentFrame(fn, false);
  }
}

function shouldConstruct(Component) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

  if (type == null) {
    return '';
  }

  if (typeof type === 'function') {
    {
      return describeNativeComponentFrame(type, shouldConstruct(type));
    }
  }

  if (typeof type === 'string') {
    return describeBuiltInComponentFrame(type);
  }

  switch (type) {
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame('Suspense');

    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame('SuspenseList');
  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeFunctionComponentFrame(type.render);

      case REACT_MEMO_TYPE:
        // Memo may contain any component type so we recursively resolve it.
        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            // Lazy may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
          } catch (x) {}
        }
    }
  }

  return '';
}

var loggedTypeFailures = {};
var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame.setExtraStackFrame(null);
    }
  }
}

function checkPropTypes(typeSpecs, values, location, componentName, element) {
  {
    // $FlowFixMe This is okay but Flow doesn't know it.
    var has = Function.call.bind(hasOwnProperty);

    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.

        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            // eslint-disable-next-line react-internal/prod-error-codes
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
        } catch (ex) {
          error$1 = ex;
        }

        if (error$1 && !(error$1 instanceof Error)) {
          setCurrentlyValidatingElement(element);

          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

          setCurrentlyValidatingElement(null);
        }

        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error$1.message] = true;
          setCurrentlyValidatingElement(element);

          error('Failed %s type: %s', location, error$1.message);

          setCurrentlyValidatingElement(null);
        }
      }
    }
  }
}

var warnedAboutMissingGetChildContext;

{
  warnedAboutMissingGetChildContext = {};
} // $FlowFixMe[incompatible-exact]


var emptyContextObject = {};

{
  Object.freeze(emptyContextObject);
}

function getMaskedContext(type, unmaskedContext) {
  {
    var contextTypes = type.contextTypes;

    if (!contextTypes) {
      return emptyContextObject;
    }

    var context = {};

    for (var key in contextTypes) {
      context[key] = unmaskedContext[key];
    }

    {
      var name = getComponentNameFromType(type) || 'Unknown';
      checkPropTypes(contextTypes, context, 'context', name);
    }

    return context;
  }
}
function processChildContext(instance, type, parentContext, childContextTypes) {
  {
    // TODO (bvaughn) Replace this behavior with an invariant() in the future.
    // It has only been added in Fiber to match the (unintentional) behavior in Stack.
    if (typeof instance.getChildContext !== 'function') {
      {
        var componentName = getComponentNameFromType(type) || 'Unknown';

        if (!warnedAboutMissingGetChildContext[componentName]) {
          warnedAboutMissingGetChildContext[componentName] = true;

          error('%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
        }
      }

      return parentContext;
    }

    var childContext = instance.getChildContext();

    for (var contextKey in childContext) {
      if (!(contextKey in childContextTypes)) {
        throw new Error((getComponentNameFromType(type) || 'Unknown') + ".getChildContext(): key \"" + contextKey + "\" is not defined in childContextTypes.");
      }
    }

    {
      var name = getComponentNameFromType(type) || 'Unknown';
      checkPropTypes(childContextTypes, childContext, 'child context', name);
    }

    return assign({}, parentContext, childContext);
  }
}

var rendererSigil;

{
  // Use this to detect multiple renderers using the same context
  rendererSigil = {};
} // Used to store the parent path of all context overrides in a shared linked list.
// Forming a reverse tree.


var rootContextSnapshot = null; // We assume that this runtime owns the "current" field on all ReactContext instances.
// This global (actually thread local) state represents what state all those "current",
// fields are currently in.

var currentActiveSnapshot = null;

function popNode(prev) {
  {
    prev.context._currentValue = prev.parentValue;
  }
}

function pushNode(next) {
  {
    next.context._currentValue = next.value;
  }
}

function popToNearestCommonAncestor(prev, next) {
  if (prev === next) ; else {
    popNode(prev);
    var parentPrev = prev.parent;
    var parentNext = next.parent;

    if (parentPrev === null) {
      if (parentNext !== null) {
        throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
      }
    } else {
      if (parentNext === null) {
        throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
      }

      popToNearestCommonAncestor(parentPrev, parentNext);
    } // On the way back, we push the new ones that weren't common.


    pushNode(next);
  }
}

function popAllPrevious(prev) {
  popNode(prev);
  var parentPrev = prev.parent;

  if (parentPrev !== null) {
    popAllPrevious(parentPrev);
  }
}

function pushAllNext(next) {
  var parentNext = next.parent;

  if (parentNext !== null) {
    pushAllNext(parentNext);
  }

  pushNode(next);
}

function popPreviousToCommonLevel(prev, next) {
  popNode(prev);
  var parentPrev = prev.parent;

  if (parentPrev === null) {
    throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
  }

  if (parentPrev.depth === next.depth) {
    // We found the same level. Now we just need to find a shared ancestor.
    popToNearestCommonAncestor(parentPrev, next);
  } else {
    // We must still be deeper.
    popPreviousToCommonLevel(parentPrev, next);
  }
}

function popNextToCommonLevel(prev, next) {
  var parentNext = next.parent;

  if (parentNext === null) {
    throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
  }

  if (prev.depth === parentNext.depth) {
    // We found the same level. Now we just need to find a shared ancestor.
    popToNearestCommonAncestor(prev, parentNext);
  } else {
    // We must still be deeper.
    popNextToCommonLevel(prev, parentNext);
  }

  pushNode(next);
} // Perform context switching to the new snapshot.
// To make it cheap to read many contexts, while not suspending, we make the switch eagerly by
// updating all the context's current values. That way reads, always just read the current value.
// At the cost of updating contexts even if they're never read by this subtree.


function switchContext(newSnapshot) {
  // The basic algorithm we need to do is to pop back any contexts that are no longer on the stack.
  // We also need to update any new contexts that are now on the stack with the deepest value.
  // The easiest way to update new contexts is to just reapply them in reverse order from the
  // perspective of the backpointers. To avoid allocating a lot when switching, we use the stack
  // for that. Therefore this algorithm is recursive.
  // 1) First we pop which ever snapshot tree was deepest. Popping old contexts as we go.
  // 2) Then we find the nearest common ancestor from there. Popping old contexts as we go.
  // 3) Then we reapply new contexts on the way back up the stack.
  var prev = currentActiveSnapshot;
  var next = newSnapshot;

  if (prev !== next) {
    if (prev === null) {
      // $FlowFixMe: This has to be non-null since it's not equal to prev.
      pushAllNext(next);
    } else if (next === null) {
      popAllPrevious(prev);
    } else if (prev.depth === next.depth) {
      popToNearestCommonAncestor(prev, next);
    } else if (prev.depth > next.depth) {
      popPreviousToCommonLevel(prev, next);
    } else {
      popNextToCommonLevel(prev, next);
    }

    currentActiveSnapshot = next;
  }
}
function pushProvider(context, nextValue) {
  var prevValue;

  {
    prevValue = context._currentValue;
    context._currentValue = nextValue;

    {
      if (context._currentRenderer !== undefined && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
        error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
      }

      context._currentRenderer = rendererSigil;
    }
  }

  var prevNode = currentActiveSnapshot;
  var newNode = {
    parent: prevNode,
    depth: prevNode === null ? 0 : prevNode.depth + 1,
    context: context,
    parentValue: prevValue,
    value: nextValue
  };
  currentActiveSnapshot = newNode;
  return newNode;
}
function popProvider(context) {
  var prevSnapshot = currentActiveSnapshot;

  if (prevSnapshot === null) {
    throw new Error('Tried to pop a Context at the root of the app. This is a bug in React.');
  }

  {
    if (prevSnapshot.context !== context) {
      error('The parent context is not the expected context. This is probably a bug in React.');
    }
  }

  {
    var value = prevSnapshot.parentValue;

    if (value === REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED) {
      prevSnapshot.context._currentValue = prevSnapshot.context._defaultValue;
    } else {
      prevSnapshot.context._currentValue = value;
    }

    {
      if (context._currentRenderer !== undefined && context._currentRenderer !== null && context._currentRenderer !== rendererSigil) {
        error('Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.');
      }

      context._currentRenderer = rendererSigil;
    }
  }

  return currentActiveSnapshot = prevSnapshot.parent;
}
function getActiveContext() {
  return currentActiveSnapshot;
}
function readContext(context) {
  var value =  context._currentValue ;
  return value;
}

/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 *
 * Note that this module is currently shared and assumed to be stateless.
 * If this becomes an actual Map, that will break.
 */
function get(key) {
  return key._reactInternals;
}
function set(key, value) {
  key._reactInternals = value;
}

var didWarnAboutNoopUpdateForComponent = {};
var didWarnAboutDeprecatedWillMount = {};
var didWarnAboutUninitializedState;
var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate;
var didWarnAboutLegacyLifecyclesAndDerivedState;
var didWarnAboutUndefinedDerivedState;
var warnOnUndefinedDerivedState;
var warnOnInvalidCallback;
var didWarnAboutDirectlyAssigningPropsToState;
var didWarnAboutContextTypeAndContextTypes;
var didWarnAboutInvalidateContextType;

{
  didWarnAboutUninitializedState = new Set();
  didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = new Set();
  didWarnAboutLegacyLifecyclesAndDerivedState = new Set();
  didWarnAboutDirectlyAssigningPropsToState = new Set();
  didWarnAboutUndefinedDerivedState = new Set();
  didWarnAboutContextTypeAndContextTypes = new Set();
  didWarnAboutInvalidateContextType = new Set();
  var didWarnOnInvalidCallback = new Set();

  warnOnInvalidCallback = function (callback, callerName) {
    if (callback === null || typeof callback === 'function') {
      return;
    }

    var key = callerName + '_' + callback;

    if (!didWarnOnInvalidCallback.has(key)) {
      didWarnOnInvalidCallback.add(key);

      error('%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
    }
  };

  warnOnUndefinedDerivedState = function (type, partialState) {
    if (partialState === undefined) {
      var componentName = getComponentNameFromType(type) || 'Component';

      if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
        didWarnAboutUndefinedDerivedState.add(componentName);

        error('%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', componentName);
      }
    }
  };
}

function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor;
    var componentName = _constructor && getComponentNameFromType(_constructor) || 'ReactClass';
    var warningKey = componentName + '.' + callerName;

    if (didWarnAboutNoopUpdateForComponent[warningKey]) {
      return;
    }

    error('%s(...): Can only update a mounting component. ' + 'This usually means you called %s() outside componentWillMount() on the server. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, componentName);

    didWarnAboutNoopUpdateForComponent[warningKey] = true;
  }
}

var classComponentUpdater = {
  isMounted: function (inst) {
    return false;
  },
  enqueueSetState: function (inst, payload, callback) {
    var internals = get(inst);

    if (internals.queue === null) {
      warnNoop(inst, 'setState');
    } else {
      internals.queue.push(payload);

      {
        if (callback !== undefined && callback !== null) {
          warnOnInvalidCallback(callback, 'setState');
        }
      }
    }
  },
  enqueueReplaceState: function (inst, payload, callback) {
    var internals = get(inst);
    internals.replace = true;
    internals.queue = [payload];

    {
      if (callback !== undefined && callback !== null) {
        warnOnInvalidCallback(callback, 'setState');
      }
    }
  },
  enqueueForceUpdate: function (inst, callback) {
    var internals = get(inst);

    if (internals.queue === null) {
      warnNoop(inst, 'forceUpdate');
    } else {
      {
        if (callback !== undefined && callback !== null) {
          warnOnInvalidCallback(callback, 'setState');
        }
      }
    }
  }
};

function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
  var partialState = getDerivedStateFromProps(nextProps, prevState);

  {
    warnOnUndefinedDerivedState(ctor, partialState);
  } // Merge the partial state and the previous state.


  var newState = partialState === null || partialState === undefined ? prevState : assign({}, prevState, partialState);
  return newState;
}

function constructClassInstance(ctor, props, maskedLegacyContext) {
  var context = emptyContextObject;
  var contextType = ctor.contextType;

  {
    if ('contextType' in ctor) {
      var isValid = // Allow null for conditional declaration
      contextType === null || contextType !== undefined && contextType.$$typeof === REACT_CONTEXT_TYPE && contextType._context === undefined; // Not a <Context.Consumer>

      if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
        didWarnAboutInvalidateContextType.add(ctor);
        var addendum = '';

        if (contextType === undefined) {
          addendum = ' However, it is set to undefined. ' + 'This can be caused by a typo or by mixing up named and default imports. ' + 'This can also happen due to a circular dependency, so ' + 'try moving the createContext() call to a separate file.';
        } else if (typeof contextType !== 'object') {
          addendum = ' However, it is set to a ' + typeof contextType + '.';
        } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
          addendum = ' Did you accidentally pass the Context.Provider instead?';
        } else if (contextType._context !== undefined) {
          // <Context.Consumer>
          addendum = ' Did you accidentally pass the Context.Consumer instead?';
        } else {
          addendum = ' However, it is set to an object with keys {' + Object.keys(contextType).join(', ') + '}.';
        }

        error('%s defines an invalid contextType. ' + 'contextType should point to the Context object returned by React.createContext().%s', getComponentNameFromType(ctor) || 'Component', addendum);
      }
    }
  }

  if (typeof contextType === 'object' && contextType !== null) {
    context = readContext(contextType);
  } else {
    context = maskedLegacyContext;
  }

  var instance = new ctor(props, context);

  {
    if (typeof ctor.getDerivedStateFromProps === 'function' && (instance.state === null || instance.state === undefined)) {
      var componentName = getComponentNameFromType(ctor) || 'Component';

      if (!didWarnAboutUninitializedState.has(componentName)) {
        didWarnAboutUninitializedState.add(componentName);

        error('`%s` uses `getDerivedStateFromProps` but its initial state is ' + '%s. This is not recommended. Instead, define the initial state by ' + 'assigning an object to `this.state` in the constructor of `%s`. ' + 'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.', componentName, instance.state === null ? 'null' : 'undefined', componentName);
      }
    } // If new component APIs are defined, "unsafe" lifecycles won't be called.
    // Warn about these lifecycles if they are present.
    // Don't warn about react-lifecycles-compat polyfilled methods though.


    if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
      var foundWillMountName = null;
      var foundWillReceivePropsName = null;
      var foundWillUpdateName = null;

      if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
        foundWillMountName = 'componentWillMount';
      } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
        foundWillMountName = 'UNSAFE_componentWillMount';
      }

      if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
        foundWillReceivePropsName = 'componentWillReceiveProps';
      } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
        foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
      }

      if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
        foundWillUpdateName = 'componentWillUpdate';
      } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        foundWillUpdateName = 'UNSAFE_componentWillUpdate';
      }

      if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
        var _componentName = getComponentNameFromType(ctor) || 'Component';

        var newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';

        if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
          didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);

          error('Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://reactjs.org/link/unsafe-component-lifecycles', _componentName, newApiName, foundWillMountName !== null ? "\n  " + foundWillMountName : '', foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : '', foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : '');
        }
      }
    }
  }

  return instance;
}

function checkClassInstance(instance, ctor, newProps) {
  {
    var name = getComponentNameFromType(ctor) || 'Component';
    var renderPresent = instance.render;

    if (!renderPresent) {
      if (ctor.prototype && typeof ctor.prototype.render === 'function') {
        error('%s(...): No `render` method found on the returned component ' + 'instance: did you accidentally return an object from the constructor?', name);
      } else {
        error('%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
      }
    }

    if (instance.getInitialState && !instance.getInitialState.isReactClassApproved && !instance.state) {
      error('getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
    }

    if (instance.getDefaultProps && !instance.getDefaultProps.isReactClassApproved) {
      error('getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
    }

    if (instance.propTypes) {
      error('propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name);
    }

    if (instance.contextType) {
      error('contextType was defined as an instance property on %s. Use a static ' + 'property to define contextType instead.', name);
    }

    {
      if (instance.contextTypes) {
        error('contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name);
      }

      if (ctor.contextType && ctor.contextTypes && !didWarnAboutContextTypeAndContextTypes.has(ctor)) {
        didWarnAboutContextTypeAndContextTypes.add(ctor);

        error('%s declares both contextTypes and contextType static properties. ' + 'The legacy contextTypes property will be ignored.', name);
      }
    }

    if (typeof instance.componentShouldUpdate === 'function') {
      error('%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
    }

    if (ctor.prototype && ctor.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
      error('%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentNameFromType(ctor) || 'A pure component');
    }

    if (typeof instance.componentDidUnmount === 'function') {
      error('%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
    }

    if (typeof instance.componentDidReceiveProps === 'function') {
      error('%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name);
    }

    if (typeof instance.componentWillRecieveProps === 'function') {
      error('%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
    }

    if (typeof instance.UNSAFE_componentWillRecieveProps === 'function') {
      error('%s has a method called ' + 'UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?', name);
    }

    var hasMutatedProps = instance.props !== newProps;

    if (instance.props !== undefined && hasMutatedProps) {
      error('%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name, name);
    }

    if (instance.defaultProps) {
      error('Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name);
    }

    if (typeof instance.getSnapshotBeforeUpdate === 'function' && typeof instance.componentDidUpdate !== 'function' && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(ctor)) {
      didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(ctor);

      error('%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). ' + 'This component defines getSnapshotBeforeUpdate() only.', getComponentNameFromType(ctor));
    }

    if (typeof instance.getDerivedStateFromProps === 'function') {
      error('%s: getDerivedStateFromProps() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
    }

    if (typeof instance.getDerivedStateFromError === 'function') {
      error('%s: getDerivedStateFromError() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name);
    }

    if (typeof ctor.getSnapshotBeforeUpdate === 'function') {
      error('%s: getSnapshotBeforeUpdate() is defined as a static method ' + 'and will be ignored. Instead, declare it as an instance method.', name);
    }

    var _state = instance.state;

    if (_state && (typeof _state !== 'object' || isArray(_state))) {
      error('%s.state: must be set to an object or null', name);
    }

    if (typeof instance.getChildContext === 'function' && typeof ctor.childContextTypes !== 'object') {
      error('%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', name);
    }
  }
}

function callComponentWillMount(type, instance) {
  var oldState = instance.state;

  if (typeof instance.componentWillMount === 'function') {
    {
      if ( instance.componentWillMount.__suppressDeprecationWarning !== true) {
        var componentName = getComponentNameFromType(type) || 'Unknown';

        if (!didWarnAboutDeprecatedWillMount[componentName]) {
          warn( // keep this warning in sync with ReactStrictModeWarning.js
          'componentWillMount has been renamed, and is not recommended for use. ' + 'See https://reactjs.org/link/unsafe-component-lifecycles for details.\n\n' + '* Move code from componentWillMount to componentDidMount (preferred in most cases) ' + 'or the constructor.\n' + '\nPlease update the following components: %s', componentName);

          didWarnAboutDeprecatedWillMount[componentName] = true;
        }
      }
    }

    instance.componentWillMount();
  }

  if (typeof instance.UNSAFE_componentWillMount === 'function') {
    instance.UNSAFE_componentWillMount();
  }

  if (oldState !== instance.state) {
    {
      error('%s.componentWillMount(): Assigning directly to this.state is ' + "deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentNameFromType(type) || 'Component');
    }

    classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
}

function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
  if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
    var oldQueue = internalInstance.queue;
    var oldReplace = internalInstance.replace;
    internalInstance.queue = null;
    internalInstance.replace = false;

    if (oldReplace && oldQueue.length === 1) {
      inst.state = oldQueue[0];
    } else {
      var nextState = oldReplace ? oldQueue[0] : inst.state;
      var dontMutate = true;

      for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
        var partial = oldQueue[i];
        var partialState = typeof partial === 'function' ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;

        if (partialState != null) {
          if (dontMutate) {
            dontMutate = false;
            nextState = assign({}, nextState, partialState);
          } else {
            assign(nextState, partialState);
          }
        }
      }

      inst.state = nextState;
    }
  } else {
    internalInstance.queue = null;
  }
} // Invokes the mount life-cycles on a previously never rendered instance.


function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
  {
    checkClassInstance(instance, ctor, newProps);
  }

  var initialState = instance.state !== undefined ? instance.state : null;
  instance.updater = classComponentUpdater;
  instance.props = newProps;
  instance.state = initialState; // We don't bother initializing the refs object on the server, since we're not going to resolve them anyway.
  // The internal instance will be used to manage updates that happen during this mount.

  var internalInstance = {
    queue: [],
    replace: false
  };
  set(instance, internalInstance);
  var contextType = ctor.contextType;

  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType);
  } else {
    instance.context = maskedLegacyContext;
  }

  {
    if (instance.state === newProps) {
      var componentName = getComponentNameFromType(ctor) || 'Component';

      if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
        didWarnAboutDirectlyAssigningPropsToState.add(componentName);

        error('%s: It is not recommended to assign props directly to state ' + "because updates to props won't be reflected in state. " + 'In most cases, it is better to use props directly.', componentName);
      }
    }
  }

  var getDerivedStateFromProps = ctor.getDerivedStateFromProps;

  if (typeof getDerivedStateFromProps === 'function') {
    instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
  } // In order to support react-lifecycles-compat polyfilled components,
  // Unsafe lifecycles should not be invoked for components using the new APIs.


  if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
    callComponentWillMount(ctor, instance); // If we had additional state updates during this life-cycle, let's
    // process them now.

    processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
  }
}

// Ids are base 32 strings whose binary representation corresponds to the
// position of a node in a tree.
// Every time the tree forks into multiple children, we add additional bits to
// the left of the sequence that represent the position of the child within the
// current level of children.
//
//      00101       00010001011010101
//      ╰─┬─╯       ╰───────┬───────╯
//   Fork 5 of 20       Parent id
//
// The leading 0s are important. In the above example, you only need 3 bits to
// represent slot 5. However, you need 5 bits to represent all the forks at
// the current level, so we must account for the empty bits at the end.
//
// For this same reason, slots are 1-indexed instead of 0-indexed. Otherwise,
// the zeroth id at a level would be indistinguishable from its parent.
//
// If a node has only one child, and does not materialize an id (i.e. does not
// contain a useId hook), then we don't need to allocate any space in the
// sequence. It's treated as a transparent indirection. For example, these two
// trees produce the same ids:
//
// <>                          <>
//   <Indirection>               <A />
//     <A />                     <B />
//   </Indirection>            </>
//   <B />
// </>
//
// However, we cannot skip any node that materializes an id. Otherwise, a parent
// id that does not fork would be indistinguishable from its child id. For
// example, this tree does not fork, but the parent and child must have
// different ids.
//
// <Parent>
//   <Child />
// </Parent>
//
// To handle this scenario, every time we materialize an id, we allocate a
// new level with a single slot. You can think of this as a fork with only one
// prong, or an array of children with length 1.
//
// It's possible for the size of the sequence to exceed 32 bits, the max
// size for bitwise operations. When this happens, we make more room by
// converting the right part of the id to a string and storing it in an overflow
// variable. We use a base 32 string representation, because 32 is the largest
// power of 2 that is supported by toString(). We want the base to be large so
// that the resulting ids are compact, and we want the base to be a power of 2
// because every log2(base) bits corresponds to a single character, i.e. every
// log2(32) = 5 bits. That means we can lop bits off the end 5 at a time without
// affecting the final result.
var emptyTreeContext = {
  id: 1,
  overflow: ''
};
function getTreeId(context) {
  var overflow = context.overflow;
  var idWithLeadingBit = context.id;
  var id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
  return id.toString(32) + overflow;
}
function pushTreeContext(baseContext, totalChildren, index) {
  var baseIdWithLeadingBit = baseContext.id;
  var baseOverflow = baseContext.overflow; // The leftmost 1 marks the end of the sequence, non-inclusive. It's not part
  // of the id; we use it to account for leading 0s.

  var baseLength = getBitLength(baseIdWithLeadingBit) - 1;
  var baseId = baseIdWithLeadingBit & ~(1 << baseLength);
  var slot = index + 1;
  var length = getBitLength(totalChildren) + baseLength; // 30 is the max length we can store without overflowing, taking into
  // consideration the leading 1 we use to mark the end of the sequence.

  if (length > 30) {
    // We overflowed the bitwise-safe range. Fall back to slower algorithm.
    // This branch assumes the length of the base id is greater than 5; it won't
    // work for smaller ids, because you need 5 bits per character.
    //
    // We encode the id in multiple steps: first the base id, then the
    // remaining digits.
    //
    // Each 5 bit sequence corresponds to a single base 32 character. So for
    // example, if the current id is 23 bits long, we can convert 20 of those
    // bits into a string of 4 characters, with 3 bits left over.
    //
    // First calculate how many bits in the base id represent a complete
    // sequence of characters.
    var numberOfOverflowBits = baseLength - baseLength % 5; // Then create a bitmask that selects only those bits.

    var newOverflowBits = (1 << numberOfOverflowBits) - 1; // Select the bits, and convert them to a base 32 string.

    var newOverflow = (baseId & newOverflowBits).toString(32); // Now we can remove those bits from the base id.

    var restOfBaseId = baseId >> numberOfOverflowBits;
    var restOfBaseLength = baseLength - numberOfOverflowBits; // Finally, encode the rest of the bits using the normal algorithm. Because
    // we made more room, this time it won't overflow.

    var restOfLength = getBitLength(totalChildren) + restOfBaseLength;
    var restOfNewBits = slot << restOfBaseLength;
    var id = restOfNewBits | restOfBaseId;
    var overflow = newOverflow + baseOverflow;
    return {
      id: 1 << restOfLength | id,
      overflow: overflow
    };
  } else {
    // Normal path
    var newBits = slot << baseLength;

    var _id = newBits | baseId;

    var _overflow = baseOverflow;
    return {
      id: 1 << length | _id,
      overflow: _overflow
    };
  }
}

function getBitLength(number) {
  return 32 - clz32(number);
}

function getLeadingBit(id) {
  return 1 << getBitLength(id) - 1;
} // TODO: Math.clz32 is supported in Node 12+. Maybe we can drop the fallback.


var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback; // Count leading zeros.
// Based on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

var log = Math.log;
var LN2 = Math.LN2;

function clz32Fallback(x) {
  var asUint = x >>> 0;

  if (asUint === 0) {
    return 32;
  }

  return 31 - (log(asUint) / LN2 | 0) | 0;
}

// Corresponds to ReactFiberWakeable and ReactFlightWakeable modules. Generally,
// changes to one module should be reflected in the others.
// TODO: Rename this module and the corresponding Fiber one to "Thenable"
// instead of "Wakeable". Or some other more appropriate name.
// TODO: Sparse arrays are bad for performance.
function createThenableState() {
  // The ThenableState is created the first time a component suspends. If it
  // suspends again, we'll reuse the same state.
  return [];
}
function trackSuspendedWakeable(wakeable) {
  // If this wakeable isn't already a thenable, turn it into one now. Then,
  // when we resume the work loop, we can check if its status is
  // still pending.
  // TODO: Get rid of the Wakeable type? It's superseded by UntrackedThenable.
  var thenable = wakeable; // We use an expando to track the status and result of a thenable so that we
  // can synchronously unwrap the value. Think of this as an extension of the
  // Promise API, or a custom interface that is a superset of Thenable.
  //
  // If the thenable doesn't have a status, set it to "pending" and attach
  // a listener that will update its status and result when it resolves.

  switch (thenable.status) {
    case 'fulfilled':
    case 'rejected':
      // A thenable that already resolved shouldn't have been thrown, so this is
      // unexpected. Suggests a mistake in a userspace data library. Don't track
      // this thenable, because if we keep trying it will likely infinite loop
      // without ever resolving.
      // TODO: Log a warning?
      break;

    default:
      {
        if (typeof thenable.status === 'string') {
          // Only instrument the thenable if the status if not defined. If
          // it's defined, but an unknown value, assume it's been instrumented by
          // some custom userspace implementation. We treat it as "pending".
          break;
        }

        var pendingThenable = thenable;
        pendingThenable.status = 'pending';
        pendingThenable.then(function (fulfilledValue) {
          if (thenable.status === 'pending') {
            var fulfilledThenable = thenable;
            fulfilledThenable.status = 'fulfilled';
            fulfilledThenable.value = fulfilledValue;
          }
        }, function (error) {
          if (thenable.status === 'pending') {
            var rejectedThenable = thenable;
            rejectedThenable.status = 'rejected';
            rejectedThenable.reason = error;
          }
        });
        break;
      }
  }
}
function trackUsedThenable(thenableState, thenable, index) {
  // This is only a separate function from trackSuspendedWakeable for symmetry
  // with Fiber.
  thenableState[index] = thenable;
}
function getPreviouslyUsedThenableAtIndex(thenableState, index) {
  if (thenableState !== null) {
    var thenable = thenableState[index];

    if (thenable !== undefined) {
      return thenable;
    }
  }

  return null;
}

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
  ;
}

var objectIs = // $FlowFixMe[method-unbinding]
typeof Object.is === 'function' ? Object.is : is;

var currentlyRenderingComponent = null;
var currentlyRenderingTask = null;
var firstWorkInProgressHook = null;
var workInProgressHook = null; // Whether the work-in-progress hook is a re-rendered hook

var isReRender = false; // Whether an update was scheduled during the currently executing render pass.

var didScheduleRenderPhaseUpdate = false; // Counts the number of useId hooks in this component

var localIdCounter = 0; // Counts the number of use(thenable) calls in this component

var thenableIndexCounter = 0;
var thenableState = null; // Lazily created map of render-phase updates

var renderPhaseUpdates = null; // Counter to prevent infinite loops.

var numberOfReRenders = 0;
var RE_RENDER_LIMIT = 25;
var isInHookUserCodeInDev = false; // In DEV, this is the name of the currently executing primitive hook

var currentHookNameInDev;

function resolveCurrentlyRenderingComponent() {
  if (currentlyRenderingComponent === null) {
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
  }

  {
    if (isInHookUserCodeInDev) {
      error('Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. ' + 'You can only call Hooks at the top level of your React function. ' + 'For more information, see ' + 'https://reactjs.org/link/rules-of-hooks');
    }
  }

  return currentlyRenderingComponent;
}

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    {
      error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
    }

    return false;
  }

  {
    // Don't bother comparing lengths in prod because these arrays should be
    // passed inline.
    if (nextDeps.length !== prevDeps.length) {
      error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + nextDeps.join(', ') + "]", "[" + prevDeps.join(', ') + "]");
    }
  } // $FlowFixMe[incompatible-use] found when upgrading Flow


  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    if (objectIs(nextDeps[i], prevDeps[i])) {
      continue;
    }

    return false;
  }

  return true;
}

function createHook() {
  if (numberOfReRenders > 0) {
    throw new Error('Rendered more hooks than during the previous render');
  }

  return {
    memoizedState: null,
    queue: null,
    next: null
  };
}

function createWorkInProgressHook() {
  if (workInProgressHook === null) {
    // This is the first hook in the list
    if (firstWorkInProgressHook === null) {
      isReRender = false;
      firstWorkInProgressHook = workInProgressHook = createHook();
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      workInProgressHook = firstWorkInProgressHook;
    }
  } else {
    if (workInProgressHook.next === null) {
      isReRender = false; // Append to the end of the list

      workInProgressHook = workInProgressHook.next = createHook();
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      workInProgressHook = workInProgressHook.next;
    }
  }

  return workInProgressHook;
}

function prepareToUseHooks(task, componentIdentity, prevThenableState) {
  currentlyRenderingComponent = componentIdentity;
  currentlyRenderingTask = task;

  {
    isInHookUserCodeInDev = false;
  } // The following should have already been reset
  // didScheduleRenderPhaseUpdate = false;
  // firstWorkInProgressHook = null;
  // numberOfReRenders = 0;
  // renderPhaseUpdates = null;
  // workInProgressHook = null;


  localIdCounter = 0;
  thenableIndexCounter = 0;
  thenableState = prevThenableState;
}
function finishHooks(Component, props, children, refOrContext) {
  // This must be called after every function component to prevent hooks from
  // being used in classes.
  while (didScheduleRenderPhaseUpdate) {
    // Updates were scheduled during the render phase. They are stored in
    // the `renderPhaseUpdates` map. Call the component again, reusing the
    // work-in-progress hooks and applying the additional updates on top. Keep
    // restarting until no more updates are scheduled.
    didScheduleRenderPhaseUpdate = false;
    localIdCounter = 0;
    thenableIndexCounter = 0;
    numberOfReRenders += 1; // Start over from the beginning of the list

    workInProgressHook = null;
    children = Component(props, refOrContext);
  }

  resetHooksState();
  return children;
}
function getThenableStateAfterSuspending() {
  var state = thenableState;
  thenableState = null;
  return state;
}
function checkDidRenderIdHook() {
  // This should be called immediately after every finishHooks call.
  // Conceptually, it's part of the return value of finishHooks; it's only a
  // separate function to avoid using an array tuple.
  var didRenderIdHook = localIdCounter !== 0;
  return didRenderIdHook;
} // Reset the internal hooks state if an error occurs while rendering a component

function resetHooksState() {
  {
    isInHookUserCodeInDev = false;
  }

  currentlyRenderingComponent = null;
  currentlyRenderingTask = null;
  didScheduleRenderPhaseUpdate = false;
  firstWorkInProgressHook = null;
  numberOfReRenders = 0;
  renderPhaseUpdates = null;
  workInProgressHook = null;
}

function readContext$1(context) {
  {
    if (isInHookUserCodeInDev) {
      error('Context can only be read while React is rendering. ' + 'In classes, you can read it in the render method or getDerivedStateFromProps. ' + 'In function components, you can read it directly in the function body, but not ' + 'inside Hooks like useReducer() or useMemo().');
    }
  }

  return readContext(context);
}

function useContext(context) {
  {
    currentHookNameInDev = 'useContext';
  }

  resolveCurrentlyRenderingComponent();
  return readContext(context);
}

function basicStateReducer(state, action) {
  // $FlowFixMe: Flow doesn't like mixed types
  return typeof action === 'function' ? action(state) : action;
}

function useState(initialState) {
  {
    currentHookNameInDev = 'useState';
  }

  return useReducer(basicStateReducer, // useReducer has a special case to support lazy useState initializers
  initialState);
}
function useReducer(reducer, initialArg, init) {
  {
    if (reducer !== basicStateReducer) {
      currentHookNameInDev = 'useReducer';
    }
  }

  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();

  if (isReRender) {
    // This is a re-render. Apply the new render phase updates to the previous
    // current hook.
    var queue = workInProgressHook.queue;
    var dispatch = queue.dispatch;

    if (renderPhaseUpdates !== null) {
      // Render phase updates are stored in a map of queue -> linked list
      var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);

      if (firstRenderPhaseUpdate !== undefined) {
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        renderPhaseUpdates.delete(queue); // $FlowFixMe[incompatible-use] found when upgrading Flow

        var newState = workInProgressHook.memoizedState;
        var update = firstRenderPhaseUpdate;

        do {
          // Process this render phase update. We don't have to check the
          // priority because it will always be the same as the current
          // render's.
          var action = update.action;

          {
            isInHookUserCodeInDev = true;
          }

          newState = reducer(newState, action);

          {
            isInHookUserCodeInDev = false;
          } // $FlowFixMe[incompatible-type] we bail out when we get a null


          update = update.next;
        } while (update !== null); // $FlowFixMe[incompatible-use] found when upgrading Flow


        workInProgressHook.memoizedState = newState;
        return [newState, dispatch];
      }
    } // $FlowFixMe[incompatible-use] found when upgrading Flow


    return [workInProgressHook.memoizedState, dispatch];
  } else {
    {
      isInHookUserCodeInDev = true;
    }

    var initialState;

    if (reducer === basicStateReducer) {
      // Special case for `useState`.
      initialState = typeof initialArg === 'function' ? initialArg() : initialArg;
    } else {
      initialState = init !== undefined ? init(initialArg) : initialArg;
    }

    {
      isInHookUserCodeInDev = false;
    } // $FlowFixMe[incompatible-use] found when upgrading Flow


    workInProgressHook.memoizedState = initialState; // $FlowFixMe[incompatible-use] found when upgrading Flow

    var _queue = workInProgressHook.queue = {
      last: null,
      dispatch: null
    };

    var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue); // $FlowFixMe[incompatible-use] found when upgrading Flow


    return [workInProgressHook.memoizedState, _dispatch];
  }
}

function useMemo(nextCreate, deps) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;

  if (workInProgressHook !== null) {
    var prevState = workInProgressHook.memoizedState;

    if (prevState !== null) {
      if (nextDeps !== null) {
        var prevDeps = prevState[1];

        if (areHookInputsEqual(nextDeps, prevDeps)) {
          return prevState[0];
        }
      }
    }
  }

  {
    isInHookUserCodeInDev = true;
  }

  var nextValue = nextCreate();

  {
    isInHookUserCodeInDev = false;
  } // $FlowFixMe[incompatible-use] found when upgrading Flow


  workInProgressHook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

function useRef(initialValue) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  var previousRef = workInProgressHook.memoizedState;

  if (previousRef === null) {
    var ref = {
      current: initialValue
    };

    {
      Object.seal(ref);
    } // $FlowFixMe[incompatible-use] found when upgrading Flow


    workInProgressHook.memoizedState = ref;
    return ref;
  } else {
    return previousRef;
  }
}

function useLayoutEffect(create, inputs) {
  {
    currentHookNameInDev = 'useLayoutEffect';

    error('useLayoutEffect does nothing on the server, because its effect cannot ' + "be encoded into the server renderer's output format. This will lead " + 'to a mismatch between the initial, non-hydrated UI and the intended ' + 'UI. To avoid this, useLayoutEffect should only be used in ' + 'components that render exclusively on the client. ' + 'See https://reactjs.org/link/uselayouteffect-ssr for common fixes.');
  }
}

function dispatchAction(componentIdentity, queue, action) {
  if (numberOfReRenders >= RE_RENDER_LIMIT) {
    throw new Error('Too many re-renders. React limits the number of renders to prevent ' + 'an infinite loop.');
  }

  if (componentIdentity === currentlyRenderingComponent) {
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdate = true;
    var update = {
      action: action,
      next: null
    };

    if (renderPhaseUpdates === null) {
      renderPhaseUpdates = new Map();
    }

    var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);

    if (firstRenderPhaseUpdate === undefined) {
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      renderPhaseUpdates.set(queue, update);
    } else {
      // Append the update to the end of the list.
      var lastRenderPhaseUpdate = firstRenderPhaseUpdate;

      while (lastRenderPhaseUpdate.next !== null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }

      lastRenderPhaseUpdate.next = update;
    }
  }
}

function useCallback(callback, deps) {
  return useMemo(function () {
    return callback;
  }, deps);
}

function throwOnUseEventCall() {
  throw new Error("A function wrapped in useEvent can't be called during rendering.");
}

function useEvent(callback) {
  return throwOnUseEventCall;
} // TODO Decide on how to implement this hook for server rendering.
// If a mutation occurs during render, consider triggering a Suspense boundary
// and falling back to client rendering.

function useMutableSource(source, getSnapshot, subscribe) {
  resolveCurrentlyRenderingComponent();
  return getSnapshot(source._source);
}

function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  if (getServerSnapshot === undefined) {
    throw new Error('Missing getServerSnapshot, which is required for ' + 'server-rendered content. Will revert to client rendering.');
  }

  return getServerSnapshot();
}

function useDeferredValue(value) {
  resolveCurrentlyRenderingComponent();
  return value;
}

function unsupportedStartTransition() {
  throw new Error('startTransition cannot be called during server rendering.');
}

function useTransition() {
  resolveCurrentlyRenderingComponent();
  return [false, unsupportedStartTransition];
}

function useId() {
  var task = currentlyRenderingTask;
  var treeId = getTreeId(task.treeContext);
  var responseState = currentResponseState;

  if (responseState === null) {
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
  }

  var localId = localIdCounter++;
  return makeId(responseState, treeId, localId);
}

function use(usable) {
  if (usable !== null && typeof usable === 'object') {
    // $FlowFixMe[method-unbinding]
    if (typeof usable.then === 'function') {
      // This is a thenable.
      var thenable = usable; // Track the position of the thenable within this fiber.

      var index = thenableIndexCounter;
      thenableIndexCounter += 1;

      switch (thenable.status) {
        case 'fulfilled':
          {
            var fulfilledValue = thenable.value;
            return fulfilledValue;
          }

        case 'rejected':
          {
            var rejectedError = thenable.reason;
            throw rejectedError;
          }

        default:
          {
            var prevThenableAtIndex = getPreviouslyUsedThenableAtIndex(thenableState, index);

            if (prevThenableAtIndex !== null) {
              switch (prevThenableAtIndex.status) {
                case 'fulfilled':
                  {
                    var _fulfilledValue = prevThenableAtIndex.value;
                    return _fulfilledValue;
                  }

                case 'rejected':
                  {
                    var _rejectedError = prevThenableAtIndex.reason;
                    throw _rejectedError;
                  }

                default:
                  {
                    // The thenable still hasn't resolved. Suspend with the same
                    // thenable as last time to avoid redundant listeners.
                    throw prevThenableAtIndex;
                  }
              }
            } else {
              // This is the first time something has been used at this index.
              // Stash the thenable at the current index so we can reuse it during
              // the next attempt.
              if (thenableState === null) {
                thenableState = createThenableState();
              }

              trackUsedThenable(thenableState, thenable, index); // Suspend.
              // TODO: Throwing here is an implementation detail that allows us to
              // unwind the call stack. But we shouldn't allow it to leak into
              // userspace. Throw an opaque placeholder value instead of the
              // actual thenable. If it doesn't get captured by the work loop, log
              // a warning, because that means something in userspace must have
              // caught it.

              throw thenable;
            }
          }
      }
    } else if (usable.$$typeof === REACT_CONTEXT_TYPE || usable.$$typeof === REACT_SERVER_CONTEXT_TYPE) {
      var context = usable;
      return readContext$1(context);
    }
  } // eslint-disable-next-line react-internal/safe-string-coercion


  throw new Error('An unsupported type was passed to use(): ' + String(usable));
}

function unsupportedRefresh() {
  throw new Error('Cache cannot be refreshed during server rendering.');
}

function useCacheRefresh() {
  return unsupportedRefresh;
}

function useMemoCache(size) {
  return new Array(size);
}

function noop() {}

var HooksDispatcher = {
  readContext: readContext$1,
  useContext: useContext,
  useMemo: useMemo,
  useReducer: useReducer,
  useRef: useRef,
  useState: useState,
  useInsertionEffect: noop,
  useLayoutEffect: useLayoutEffect,
  useCallback: useCallback,
  // useImperativeHandle is not run in the server environment
  useImperativeHandle: noop,
  // Effects are not run in the server environment.
  useEffect: noop,
  // Debugging effect
  useDebugValue: noop,
  useDeferredValue: useDeferredValue,
  useTransition: useTransition,
  useId: useId,
  // Subscriptions are not setup in a server environment.
  useMutableSource: useMutableSource,
  useSyncExternalStore: useSyncExternalStore
};

{
  HooksDispatcher.useCacheRefresh = useCacheRefresh;
}

{
  HooksDispatcher.useEvent = useEvent;
}

{
  HooksDispatcher.useMemoCache = useMemoCache;
}

{
  HooksDispatcher.use = use;
}

var currentResponseState = null;
function setCurrentResponseState(responseState) {
  currentResponseState = responseState;
}

function getCacheSignal() {
  throw new Error('Not implemented.');
}

function getCacheForType(resourceType) {
  throw new Error('Not implemented.');
}

var DefaultCacheDispatcher = {
  getCacheSignal: getCacheSignal,
  getCacheForType: getCacheForType
};

function getStackByComponentStackNode(componentStack) {
  try {
    var info = '';
    var node = componentStack;

    do {
      switch (node.tag) {
        case 0:
          info += describeBuiltInComponentFrame(node.type, null, null);
          break;

        case 1:
          info += describeFunctionComponentFrame(node.type, null, null);
          break;

        case 2:
          info += describeClassComponentFrame(node.type, null, null);
          break;
      } // $FlowFixMe[incompatible-type] we bail out when we get a null


      node = node.parent;
    } while (node);

    return info;
  } catch (x) {
    return '\nError generating stack: ' + x.message + '\n' + x.stack;
  }
}

var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
var ReactCurrentCache = ReactSharedInternals.ReactCurrentCache;
var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
var PENDING = 0;
var COMPLETED = 1;
var FLUSHED = 2;
var ABORTED = 3;
var ERRORED = 4;
var OPEN = 0;
var CLOSING = 1;
var CLOSED = 2;
// This is a default heuristic for how to split up the HTML content into progressive
// loading. Our goal is to be able to display additional new content about every 500ms.
// Faster than that is unnecessary and should be throttled on the client. It also
// adds unnecessary overhead to do more splits. We don't know if it's a higher or lower
// end device but higher end suffer less from the overhead than lower end does from
// not getting small enough pieces. We error on the side of low end.
// We base this on low end 3G speeds which is about 500kbits per second. We assume
// that there can be a reasonable drop off from max bandwidth which leaves you with
// as little as 80%. We can receive half of that each 500ms - at best. In practice,
// a little bandwidth is lost to processing and contention - e.g. CSS and images that
// are downloaded along with the main content. So we estimate about half of that to be
// the lower end throughput. In other words, we expect that you can at least show
// about 12.5kb of content per 500ms. Not counting starting latency for the first
// paint.
// 500 * 1024 / 8 * .8 * 0.5 / 2
var DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;

function defaultErrorHandler(error) {
  console['error'](error); // Don't transform to our wrapper

  return null;
}

function noop$1() {}

function createRequest(children, responseState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError) {
  var pingedTasks = [];
  var abortSet = new Set();
  var resources = createResources();
  var request = {
    destination: null,
    responseState: responseState,
    progressiveChunkSize: progressiveChunkSize === undefined ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize,
    status: OPEN,
    fatalError: null,
    nextSegmentId: 0,
    allPendingTasks: 0,
    pendingRootTasks: 0,
    resources: resources,
    completedRootSegment: null,
    abortableTasks: abortSet,
    pingedTasks: pingedTasks,
    clientRenderedBoundaries: [],
    completedBoundaries: [],
    partialBoundaries: [],
    preamble: [],
    postamble: [],
    onError: onError === undefined ? defaultErrorHandler : onError,
    onAllReady: onAllReady === undefined ? noop$1 : onAllReady,
    onShellReady: onShellReady === undefined ? noop$1 : onShellReady,
    onShellError: onShellError === undefined ? noop$1 : onShellError,
    onFatalError: onFatalError === undefined ? noop$1 : onFatalError
  }; // This segment represents the root fallback.

  var rootSegment = createPendingSegment(request, 0, null, rootFormatContext, // Root segments are never embedded in Text on either edge
  false, false); // There is no parent so conceptually, we're unblocked to flush this segment.

  rootSegment.parentFlushed = true;
  var rootTask = createTask(request, null, children, null, rootSegment, abortSet, emptyContextObject, rootContextSnapshot, emptyTreeContext);
  pingedTasks.push(rootTask);
  return request;
}

function pingTask(request, task) {
  var pingedTasks = request.pingedTasks;
  pingedTasks.push(task);

  if (pingedTasks.length === 1) {
    scheduleWork(function () {
      return performWork(request);
    });
  }
}

function createSuspenseBoundary(request, fallbackAbortableTasks) {
  return {
    id: UNINITIALIZED_SUSPENSE_BOUNDARY_ID,
    rootSegmentID: -1,
    parentFlushed: false,
    pendingTasks: 0,
    forceClientRender: false,
    completedSegments: [],
    byteSize: 0,
    fallbackAbortableTasks: fallbackAbortableTasks,
    errorDigest: null,
    resources: createBoundaryResources()
  };
}

function createTask(request, thenableState, node, blockedBoundary, blockedSegment, abortSet, legacyContext, context, treeContext) {
  request.allPendingTasks++;

  if (blockedBoundary === null) {
    request.pendingRootTasks++;
  } else {
    blockedBoundary.pendingTasks++;
  }

  var task = {
    node: node,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: blockedSegment,
    abortSet: abortSet,
    legacyContext: legacyContext,
    context: context,
    treeContext: treeContext,
    thenableState: thenableState
  };

  {
    task.componentStack = null;
  }

  abortSet.add(task);
  return task;
}

function createPendingSegment(request, index, boundary, formatContext, lastPushedText, textEmbedded) {
  return {
    status: PENDING,
    id: -1,
    // lazily assigned later
    index: index,
    parentFlushed: false,
    chunks: [],
    children: [],
    formatContext: formatContext,
    boundary: boundary,
    lastPushedText: lastPushedText,
    textEmbedded: textEmbedded
  };
} // DEV-only global reference to the currently executing task


var currentTaskInDEV = null;

function getCurrentStackInDEV() {
  {
    if (currentTaskInDEV === null || currentTaskInDEV.componentStack === null) {
      return '';
    }

    return getStackByComponentStackNode(currentTaskInDEV.componentStack);
  }
}

function pushBuiltInComponentStackInDEV(task, type) {
  {
    task.componentStack = {
      tag: 0,
      parent: task.componentStack,
      type: type
    };
  }
}

function pushFunctionComponentStackInDEV(task, type) {
  {
    task.componentStack = {
      tag: 1,
      parent: task.componentStack,
      type: type
    };
  }
}

function pushClassComponentStackInDEV(task, type) {
  {
    task.componentStack = {
      tag: 2,
      parent: task.componentStack,
      type: type
    };
  }
}

function popComponentStackInDEV(task) {
  {
    if (task.componentStack === null) {
      error('Unexpectedly popped too many stack frames. This is a bug in React.');
    } else {
      task.componentStack = task.componentStack.parent;
    }
  }
} // stash the component stack of an unwinding error until it is processed


var lastBoundaryErrorComponentStackDev = null;

function captureBoundaryErrorDetailsDev(boundary, error) {
  {
    var errorMessage;

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error.message === 'string') {
      errorMessage = error.message;
    } else {
      // eslint-disable-next-line react-internal/safe-string-coercion
      errorMessage = String(error);
    }

    var errorComponentStack = lastBoundaryErrorComponentStackDev || getCurrentStackInDEV();
    lastBoundaryErrorComponentStackDev = null;
    boundary.errorMessage = errorMessage;
    boundary.errorComponentStack = errorComponentStack;
  }
}

function logRecoverableError(request, error) {
  // If this callback errors, we intentionally let that error bubble up to become a fatal error
  // so that someone fixes the error reporting instead of hiding it.
  var errorDigest = request.onError(error);

  if (errorDigest != null && typeof errorDigest !== 'string') {
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error("onError returned something with a type other than \"string\". onError should return a string and may return null or undefined but must not return anything else. It received something of type \"" + typeof errorDigest + "\" instead");
  }

  return errorDigest;
}

function fatalError(request, error) {
  // This is called outside error handling code such as if the root errors outside
  // a suspense boundary or if the root suspense boundary's fallback errors.
  // It's also called if React itself or its host configs errors.
  var onShellError = request.onShellError;
  onShellError(error);
  var onFatalError = request.onFatalError;
  onFatalError(error);

  if (request.destination !== null) {
    request.status = CLOSED;
    closeWithError(request.destination, error);
  } else {
    request.status = CLOSING;
    request.fatalError = error;
  }
}

function renderSuspenseBoundary(request, task, props) {
  pushBuiltInComponentStackInDEV(task, 'Suspense');
  var parentBoundary = task.blockedBoundary;
  var parentSegment = task.blockedSegment; // Each time we enter a suspense boundary, we split out into a new segment for
  // the fallback so that we can later replace that segment with the content.
  // This also lets us split out the main content even if it doesn't suspend,
  // in case it ends up generating a large subtree of content.

  var fallback = props.fallback;
  var content = props.children;
  var fallbackAbortSet = new Set();
  var newBoundary = createSuspenseBoundary(request, fallbackAbortSet);
  var insertionIndex = parentSegment.chunks.length; // The children of the boundary segment is actually the fallback.

  var boundarySegment = createPendingSegment(request, insertionIndex, newBoundary, parentSegment.formatContext, // boundaries never require text embedding at their edges because comment nodes bound them
  false, false);
  parentSegment.children.push(boundarySegment); // The parentSegment has a child Segment at this index so we reset the lastPushedText marker on the parent

  parentSegment.lastPushedText = false; // This segment is the actual child content. We can start rendering that immediately.

  var contentRootSegment = createPendingSegment(request, 0, null, parentSegment.formatContext, // boundaries never require text embedding at their edges because comment nodes bound them
  false, false); // We mark the root segment as having its parent flushed. It's not really flushed but there is
  // no parent segment so there's nothing to wait on.

  contentRootSegment.parentFlushed = true; // Currently this is running synchronously. We could instead schedule this to pingedTasks.
  // I suspect that there might be some efficiency benefits from not creating the suspended task
  // and instead just using the stack if possible.
  // TODO: Call this directly instead of messing with saving and restoring contexts.
  // We can reuse the current context and task to render the content immediately without
  // context switching. We just need to temporarily switch which boundary and which segment
  // we're writing to. If something suspends, it'll spawn new suspended task with that context.

  task.blockedBoundary = newBoundary;
  task.blockedSegment = contentRootSegment;

  {
    setCurrentlyRenderingBoundaryResourcesTarget(request.resources, newBoundary.resources);
  }

  try {
    // We use the safe form because we don't handle suspending here. Only error handling.
    renderNode(request, task, content);
    pushSegmentFinale(contentRootSegment.chunks, request.responseState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded);
    contentRootSegment.status = COMPLETED;

    if (enableFloat) {
      if (newBoundary.pendingTasks === 0) {
        hoistCompletedBoundaryResources(request, newBoundary);
      }
    }

    queueCompletedSegment(newBoundary, contentRootSegment);

    if (newBoundary.pendingTasks === 0) {
      // This must have been the last segment we were waiting on. This boundary is now complete.
      // Therefore we won't need the fallback. We early return so that we don't have to create
      // the fallback.
      popComponentStackInDEV(task);
      return;
    }
  } catch (error) {
    contentRootSegment.status = ERRORED;
    newBoundary.forceClientRender = true;
    newBoundary.errorDigest = logRecoverableError(request, error);

    {
      captureBoundaryErrorDetailsDev(newBoundary, error);
    } // We don't need to decrement any task numbers because we didn't spawn any new task.
    // We don't need to schedule any task because we know the parent has written yet.
    // We do need to fallthrough to create the fallback though.

  } finally {
    {
      setCurrentlyRenderingBoundaryResourcesTarget(request.resources, parentBoundary ? parentBoundary.resources : null);
    }

    task.blockedBoundary = parentBoundary;
    task.blockedSegment = parentSegment;
  } // We create suspended task for the fallback because we don't want to actually work
  // on it yet in case we finish the main content, so we queue for later.


  var suspendedFallbackTask = createTask(request, null, fallback, parentBoundary, boundarySegment, fallbackAbortSet, task.legacyContext, task.context, task.treeContext);

  {
    suspendedFallbackTask.componentStack = task.componentStack;
  } // TODO: This should be queued at a separate lower priority queue so that we only work
  // on preparing fallbacks if we don't have any more main content to task on.


  request.pingedTasks.push(suspendedFallbackTask);
  popComponentStackInDEV(task);
}

function hoistCompletedBoundaryResources(request, completedBoundary) {
  if (request.completedRootSegment !== null || request.pendingRootTasks > 0) {
    // The Shell has not flushed yet. we can hoist Resources for this boundary
    // all the way to the Root.
    hoistResourcesToRoot(request.resources, completedBoundary.resources);
  } // We don't hoist if the root already flushed because late resources will be hoisted
  // as boundaries flush

}

function renderHostElement(request, task, type, props) {
  pushBuiltInComponentStackInDEV(task, type);
  var segment = task.blockedSegment;
  var children = pushStartInstance(segment.chunks, request.preamble, type, props, request.responseState, segment.formatContext, segment.lastPushedText);
  segment.lastPushedText = false;
  var prevContext = segment.formatContext;
  segment.formatContext = getChildFormatContext(prevContext, type, props); // We use the non-destructive form because if something suspends, we still
  // need to pop back up and finish this subtree of HTML.

  renderNode(request, task, children); // We expect that errors will fatal the whole task and that we don't need
  // the correct context. Therefore this is not in a finally.

  segment.formatContext = prevContext;
  pushEndInstance(segment.chunks, request.postamble, type);
  segment.lastPushedText = false;
  popComponentStackInDEV(task);
}

function shouldConstruct$1(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}

function renderWithHooks(request, task, prevThenableState, Component, props, secondArg) {
  var componentIdentity = {};
  prepareToUseHooks(task, componentIdentity, prevThenableState);
  var result = Component(props, secondArg);
  return finishHooks(Component, props, result, secondArg);
}

function finishClassComponent(request, task, instance, Component, props) {
  var nextChildren = instance.render();

  {
    if (instance.props !== props) {
      if (!didWarnAboutReassigningProps) {
        error('It looks like %s is reassigning its own `this.props` while rendering. ' + 'This is not supported and can lead to confusing bugs.', getComponentNameFromType(Component) || 'a component');
      }

      didWarnAboutReassigningProps = true;
    }
  }

  {
    var childContextTypes = Component.childContextTypes;

    if (childContextTypes !== null && childContextTypes !== undefined) {
      var previousContext = task.legacyContext;
      var mergedContext = processChildContext(instance, Component, previousContext, childContextTypes);
      task.legacyContext = mergedContext;
      renderNodeDestructive(request, task, null, nextChildren);
      task.legacyContext = previousContext;
      return;
    }
  }

  renderNodeDestructive(request, task, null, nextChildren);
}

function renderClassComponent(request, task, Component, props) {
  pushClassComponentStackInDEV(task, Component);
  var maskedContext =  getMaskedContext(Component, task.legacyContext) ;
  var instance = constructClassInstance(Component, props, maskedContext);
  mountClassInstance(instance, Component, props, maskedContext);
  finishClassComponent(request, task, instance, Component, props);
  popComponentStackInDEV(task);
}

var didWarnAboutBadClass = {};
var didWarnAboutModulePatternComponent = {};
var didWarnAboutContextTypeOnFunctionComponent = {};
var didWarnAboutGetDerivedStateOnFunctionComponent = {};
var didWarnAboutReassigningProps = false;
var didWarnAboutGenerators = false;
var didWarnAboutMaps = false;
var hasWarnedAboutUsingContextAsConsumer = false; // This would typically be a function component but we still support module pattern
// components for some reason.

function renderIndeterminateComponent(request, task, prevThenableState, Component, props) {
  var legacyContext;

  {
    legacyContext = getMaskedContext(Component, task.legacyContext);
  }

  pushFunctionComponentStackInDEV(task, Component);

  {
    if (Component.prototype && typeof Component.prototype.render === 'function') {
      var componentName = getComponentNameFromType(Component) || 'Unknown';

      if (!didWarnAboutBadClass[componentName]) {
        error("The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);

        didWarnAboutBadClass[componentName] = true;
      }
    }
  }

  var value = renderWithHooks(request, task, prevThenableState, Component, props, legacyContext);
  var hasId = checkDidRenderIdHook();

  {
    // Support for module components is deprecated and is removed behind a flag.
    // Whether or not it would crash later, we want to show a good message in DEV first.
    if (typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
      var _componentName = getComponentNameFromType(Component) || 'Unknown';

      if (!didWarnAboutModulePatternComponent[_componentName]) {
        error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName, _componentName, _componentName);

        didWarnAboutModulePatternComponent[_componentName] = true;
      }
    }
  }

  if ( // Run these checks in production only if the flag is off.
  // Eventually we'll delete this branch altogether.
   typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
    {
      var _componentName2 = getComponentNameFromType(Component) || 'Unknown';

      if (!didWarnAboutModulePatternComponent[_componentName2]) {
        error('The <%s /> component appears to be a function component that returns a class instance. ' + 'Change %s to a class that extends React.Component instead. ' + "If you can't use a class try assigning the prototype on the function as a workaround. " + "`%s.prototype = React.Component.prototype`. Don't use an arrow function since it " + 'cannot be called with `new` by React.', _componentName2, _componentName2, _componentName2);

        didWarnAboutModulePatternComponent[_componentName2] = true;
      }
    }

    mountClassInstance(value, Component, props, legacyContext);
    finishClassComponent(request, task, value, Component, props);
  } else {

    {
      validateFunctionComponentInDev(Component);
    } // We're now successfully past this task, and we don't have to pop back to
    // the previous task every again, so we can use the destructive recursive form.


    if (hasId) {
      // This component materialized an id. We treat this as its own level, with
      // a single "child" slot.
      var prevTreeContext = task.treeContext;
      var totalChildren = 1;
      var index = 0;
      task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);

      try {
        renderNodeDestructive(request, task, null, value);
      } finally {
        task.treeContext = prevTreeContext;
      }
    } else {
      renderNodeDestructive(request, task, null, value);
    }
  }

  popComponentStackInDEV(task);
}

function validateFunctionComponentInDev(Component) {
  {
    if (Component) {
      if (Component.childContextTypes) {
        error('%s(...): childContextTypes cannot be defined on a function component.', Component.displayName || Component.name || 'Component');
      }
    }

    if (typeof Component.getDerivedStateFromProps === 'function') {
      var _componentName3 = getComponentNameFromType(Component) || 'Unknown';

      if (!didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3]) {
        error('%s: Function components do not support getDerivedStateFromProps.', _componentName3);

        didWarnAboutGetDerivedStateOnFunctionComponent[_componentName3] = true;
      }
    }

    if (typeof Component.contextType === 'object' && Component.contextType !== null) {
      var _componentName4 = getComponentNameFromType(Component) || 'Unknown';

      if (!didWarnAboutContextTypeOnFunctionComponent[_componentName4]) {
        error('%s: Function components do not support contextType.', _componentName4);

        didWarnAboutContextTypeOnFunctionComponent[_componentName4] = true;
      }
    }
  }
}

function resolveDefaultProps(Component, baseProps) {
  if (Component && Component.defaultProps) {
    // Resolve default props. Taken from ReactElement
    var props = assign({}, baseProps);
    var defaultProps = Component.defaultProps;

    for (var propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }

    return props;
  }

  return baseProps;
}

function renderForwardRef(request, task, prevThenableState, type, props, ref) {
  pushFunctionComponentStackInDEV(task, type.render);
  var children = renderWithHooks(request, task, prevThenableState, type.render, props, ref);
  var hasId = checkDidRenderIdHook();

  if (hasId) {
    // This component materialized an id. We treat this as its own level, with
    // a single "child" slot.
    var prevTreeContext = task.treeContext;
    var totalChildren = 1;
    var index = 0;
    task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);

    try {
      renderNodeDestructive(request, task, null, children);
    } finally {
      task.treeContext = prevTreeContext;
    }
  } else {
    renderNodeDestructive(request, task, null, children);
  }

  popComponentStackInDEV(task);
}

function renderMemo(request, task, prevThenableState, type, props, ref) {
  var innerType = type.type;
  var resolvedProps = resolveDefaultProps(innerType, props);
  renderElement(request, task, prevThenableState, innerType, resolvedProps, ref);
}

function renderContextConsumer(request, task, context, props) {
  // The logic below for Context differs depending on PROD or DEV mode. In
  // DEV mode, we create a separate object for Context.Consumer that acts
  // like a proxy to Context. This proxy object adds unnecessary code in PROD
  // so we use the old behaviour (Context.Consumer references Context) to
  // reduce size and overhead. The separate object references context via
  // a property called "_context", which also gives us the ability to check
  // in DEV mode if this property exists or not and warn if it does not.
  {
    if (context._context === undefined) {
      // This may be because it's a Context (rather than a Consumer).
      // Or it may be because it's older React where they're the same thing.
      // We only want to warn if we're sure it's a new React.
      if (context !== context.Consumer) {
        if (!hasWarnedAboutUsingContextAsConsumer) {
          hasWarnedAboutUsingContextAsConsumer = true;

          error('Rendering <Context> directly is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
        }
      }
    } else {
      context = context._context;
    }
  }

  var render = props.children;

  {
    if (typeof render !== 'function') {
      error('A context consumer was rendered with multiple children, or a child ' + "that isn't a function. A context consumer expects a single child " + 'that is a function. If you did pass a function, make sure there ' + 'is no trailing or leading whitespace around it.');
    }
  }

  var newValue = readContext(context);
  var newChildren = render(newValue);
  renderNodeDestructive(request, task, null, newChildren);
}

function renderContextProvider(request, task, type, props) {
  var context = type._context;
  var value = props.value;
  var children = props.children;
  var prevSnapshot;

  {
    prevSnapshot = task.context;
  }

  task.context = pushProvider(context, value);
  renderNodeDestructive(request, task, null, children);
  task.context = popProvider(context);

  {
    if (prevSnapshot !== task.context) {
      error('Popping the context provider did not return back to the original snapshot. This is a bug in React.');
    }
  }
}

function renderLazyComponent(request, task, prevThenableState, lazyComponent, props, ref) {
  pushBuiltInComponentStackInDEV(task, 'Lazy');
  var payload = lazyComponent._payload;
  var init = lazyComponent._init;
  var Component = init(payload);
  var resolvedProps = resolveDefaultProps(Component, props);
  renderElement(request, task, prevThenableState, Component, resolvedProps, ref);
  popComponentStackInDEV(task);
}

function renderOffscreen(request, task, props) {
  var mode = props.mode;

  if (mode === 'hidden') ; else {
    // A visible Offscreen boundary is treated exactly like a fragment: a
    // pure indirection.
    renderNodeDestructive(request, task, null, props.children);
  }
}

function renderElement(request, task, prevThenableState, type, props, ref) {
  if (typeof type === 'function') {
    if (shouldConstruct$1(type)) {
      renderClassComponent(request, task, type, props);
      return;
    } else {
      renderIndeterminateComponent(request, task, prevThenableState, type, props);
      return;
    }
  }

  if (typeof type === 'string') {
    renderHostElement(request, task, type, props);
    return;
  }

  switch (type) {
    // LegacyHidden acts the same as a fragment. This only works because we
    // currently assume that every instance of LegacyHidden is accompanied by a
    // host component wrapper. In the hidden mode, the host component is given a
    // `hidden` attribute, which ensures that the initial HTML is not visible.
    // To support the use of LegacyHidden as a true fragment, without an extra
    // DOM node, we would have to hide the initial HTML in some other way.
    // TODO: Delete in LegacyHidden. It's an unstable API only used in the
    // www build. As a migration step, we could add a special prop to Offscreen
    // that simulates the old behavior (no hiding, no change to effects).
    case REACT_LEGACY_HIDDEN_TYPE:
    case REACT_DEBUG_TRACING_MODE_TYPE:
    case REACT_STRICT_MODE_TYPE:
    case REACT_PROFILER_TYPE:
    case REACT_FRAGMENT_TYPE:
      {
        renderNodeDestructive(request, task, null, props.children);
        return;
      }

    case REACT_OFFSCREEN_TYPE:
      {
        renderOffscreen(request, task, props);
        return;
      }

    case REACT_SUSPENSE_LIST_TYPE:
      {
        pushBuiltInComponentStackInDEV(task, 'SuspenseList'); // TODO: SuspenseList should control the boundaries.

        renderNodeDestructive(request, task, null, props.children);
        popComponentStackInDEV(task);
        return;
      }

    case REACT_SCOPE_TYPE:
      {

        throw new Error('ReactDOMServer does not yet support scope components.');
      }
    // eslint-disable-next-line-no-fallthrough

    case REACT_SUSPENSE_TYPE:
      {
        {
          renderSuspenseBoundary(request, task, props);
        }

        return;
      }
  }

  if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        {
          renderForwardRef(request, task, prevThenableState, type, props, ref);
          return;
        }

      case REACT_MEMO_TYPE:
        {
          renderMemo(request, task, prevThenableState, type, props, ref);
          return;
        }

      case REACT_PROVIDER_TYPE:
        {
          renderContextProvider(request, task, type, props);
          return;
        }

      case REACT_CONTEXT_TYPE:
        {
          renderContextConsumer(request, task, type, props);
          return;
        }

      case REACT_LAZY_TYPE:
        {
          renderLazyComponent(request, task, prevThenableState, type, props);
          return;
        }
    }
  }

  var info = '';

  {
    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
    }
  }

  throw new Error('Element type is invalid: expected a string (for built-in ' + 'components) or a class/function (for composite components) ' + ("but got: " + (type == null ? type : typeof type) + "." + info));
}

function validateIterable(iterable, iteratorFn) {
  {
    // We don't support rendering Generators because it's a mutation.
    // See https://github.com/facebook/react/issues/12995
    if (typeof Symbol === 'function' && // $FlowFixMe Flow doesn't know about toStringTag
    iterable[Symbol.toStringTag] === 'Generator') {
      if (!didWarnAboutGenerators) {
        error('Using Generators as children is unsupported and will likely yield ' + 'unexpected results because enumerating a generator mutates it. ' + 'You may convert it to an array with `Array.from()` or the ' + '`[...spread]` operator before rendering. Keep in mind ' + 'you might need to polyfill these features for older browsers.');
      }

      didWarnAboutGenerators = true;
    } // Warn about using Maps as children


    if (iterable.entries === iteratorFn) {
      if (!didWarnAboutMaps) {
        error('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
      }

      didWarnAboutMaps = true;
    }
  }
}

function renderNodeDestructive(request, task, // The thenable state reused from the previous attempt, if any. This is almost
// always null, except when called by retryTask.
prevThenableState, node) {
  {
    // In Dev we wrap renderNodeDestructiveImpl in a try / catch so we can capture
    // a component stack at the right place in the tree. We don't do this in renderNode
    // becuase it is not called at every layer of the tree and we may lose frames
    try {
      return renderNodeDestructiveImpl(request, task, prevThenableState, node);
    } catch (x) {
      if (typeof x === 'object' && x !== null && typeof x.then === 'function') ; else {
        // This is an error, stash the component stack if it is null.
        lastBoundaryErrorComponentStackDev = lastBoundaryErrorComponentStackDev !== null ? lastBoundaryErrorComponentStackDev : getCurrentStackInDEV();
      } // rethrow so normal suspense logic can handle thrown value accordingly


      throw x;
    }
  }
} // This function by it self renders a node and consumes the task by mutating it
// to update the current execution state.


function renderNodeDestructiveImpl(request, task, prevThenableState, node) {
  // Stash the node we're working on. We'll pick up from this task in case
  // something suspends.
  task.node = node; // Handle object types

  if (typeof node === 'object' && node !== null) {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        {
          var element = node;
          var type = element.type;
          var props = element.props;
          var ref = element.ref;
          renderElement(request, task, prevThenableState, type, props, ref);
          return;
        }

      case REACT_PORTAL_TYPE:
        throw new Error('Portals are not currently supported by the server renderer. ' + 'Render them conditionally so that they only appear on the client render.');
      // eslint-disable-next-line-no-fallthrough

      case REACT_LAZY_TYPE:
        {
          var lazyNode = node;
          var payload = lazyNode._payload;
          var init = lazyNode._init;
          var resolvedNode;

          {
            try {
              resolvedNode = init(payload);
            } catch (x) {
              if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
                // this Lazy initializer is suspending. push a temporary frame onto the stack so it can be
                // popped off in spawnNewSuspendedTask. This aligns stack behavior between Lazy in element position
                // vs Component position. We do not want the frame for Errors so we exclusively do this in
                // the wakeable branch
                pushBuiltInComponentStackInDEV(task, 'Lazy');
              }

              throw x;
            }
          }

          renderNodeDestructive(request, task, null, resolvedNode);
          return;
        }
    }

    if (isArray(node)) {
      renderChildrenArray(request, task, node);
      return;
    }

    var iteratorFn = getIteratorFn(node);

    if (iteratorFn) {
      {
        validateIterable(node, iteratorFn);
      }

      var iterator = iteratorFn.call(node);

      if (iterator) {
        // We need to know how many total children are in this set, so that we
        // can allocate enough id slots to acommodate them. So we must exhaust
        // the iterator before we start recursively rendering the children.
        // TODO: This is not great but I think it's inherent to the id
        // generation algorithm.
        var step = iterator.next(); // If there are not entries, we need to push an empty so we start by checking that.

        if (!step.done) {
          var children = [];

          do {
            children.push(step.value);
            step = iterator.next();
          } while (!step.done);

          renderChildrenArray(request, task, children);
          return;
        }

        return;
      }
    } // $FlowFixMe[method-unbinding]


    var childString = Object.prototype.toString.call(node);
    throw new Error("Objects are not valid as a React child (found: " + (childString === '[object Object]' ? 'object with keys {' + Object.keys(node).join(', ') + '}' : childString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
  }

  if (typeof node === 'string') {
    var segment = task.blockedSegment;
    segment.lastPushedText = pushTextInstance(task.blockedSegment.chunks, node, request.responseState, segment.lastPushedText);
    return;
  }

  if (typeof node === 'number') {
    var _segment = task.blockedSegment;
    _segment.lastPushedText = pushTextInstance(task.blockedSegment.chunks, '' + node, request.responseState, _segment.lastPushedText);
    return;
  }

  {
    if (typeof node === 'function') {
      error('Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.');
    }
  }
}

function renderChildrenArray(request, task, children) {
  var totalChildren = children.length;

  for (var i = 0; i < totalChildren; i++) {
    var prevTreeContext = task.treeContext;
    task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);

    try {
      // We need to use the non-destructive form so that we can safely pop back
      // up and render the sibling if something suspends.
      renderNode(request, task, children[i]);
    } finally {
      task.treeContext = prevTreeContext;
    }
  }
}

function spawnNewSuspendedTask(request, task, thenableState, x) {
  // Something suspended, we'll need to create a new segment and resolve it later.
  var segment = task.blockedSegment;
  var insertionIndex = segment.chunks.length;
  var newSegment = createPendingSegment(request, insertionIndex, null, segment.formatContext, // Adopt the parent segment's leading text embed
  segment.lastPushedText, // Assume we are text embedded at the trailing edge
  true);
  segment.children.push(newSegment); // Reset lastPushedText for current Segment since the new Segment "consumed" it

  segment.lastPushedText = false;
  var newTask = createTask(request, thenableState, task.node, task.blockedBoundary, newSegment, task.abortSet, task.legacyContext, task.context, task.treeContext);
  trackSuspendedWakeable(x);

  {
    if (task.componentStack !== null) {
      // We pop one task off the stack because the node that suspended will be tried again,
      // which will add it back onto the stack.
      newTask.componentStack = task.componentStack.parent;
    }
  }

  var ping = newTask.ping;
  x.then(ping, ping);
} // This is a non-destructive form of rendering a node. If it suspends it spawns
// a new task and restores the context of this task to what it was before.


function renderNode(request, task, node) {
  // TODO: Store segment.children.length here and reset it in case something
  // suspended partially through writing something.
  // Snapshot the current context in case something throws to interrupt the
  // process.
  var previousFormatContext = task.blockedSegment.formatContext;
  var previousLegacyContext = task.legacyContext;
  var previousContext = task.context;
  var previousComponentStack = null;

  {
    previousComponentStack = task.componentStack;
  }

  try {
    return renderNodeDestructive(request, task, null, node);
  } catch (x) {
    resetHooksState();

    if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
      var thenableState = getThenableStateAfterSuspending();
      spawnNewSuspendedTask(request, task, thenableState, x); // Restore the context. We assume that this will be restored by the inner
      // functions in case nothing throws so we don't use "finally" here.

      task.blockedSegment.formatContext = previousFormatContext;
      task.legacyContext = previousLegacyContext;
      task.context = previousContext; // Restore all active ReactContexts to what they were before.

      switchContext(previousContext);

      {
        task.componentStack = previousComponentStack;
      }

      return;
    } else {
      // Restore the context. We assume that this will be restored by the inner
      // functions in case nothing throws so we don't use "finally" here.
      task.blockedSegment.formatContext = previousFormatContext;
      task.legacyContext = previousLegacyContext;
      task.context = previousContext; // Restore all active ReactContexts to what they were before.

      switchContext(previousContext);

      {
        task.componentStack = previousComponentStack;
      } // We assume that we don't need the correct context.
      // Let's terminate the rest of the tree and don't render any siblings.


      throw x;
    }
  }
}

function erroredTask(request, boundary, segment, error) {
  // Report the error to a global handler.
  var errorDigest = logRecoverableError(request, error);

  if (boundary === null) {
    fatalError(request, error);
  } else {
    boundary.pendingTasks--;

    if (!boundary.forceClientRender) {
      boundary.forceClientRender = true;
      boundary.errorDigest = errorDigest;

      {
        captureBoundaryErrorDetailsDev(boundary, error);
      } // Regardless of what happens next, this boundary won't be displayed,
      // so we can flush it, if the parent already flushed.


      if (boundary.parentFlushed) {
        // We don't have a preference where in the queue this goes since it's likely
        // to error on the client anyway. However, intentionally client-rendered
        // boundaries should be flushed earlier so that they can start on the client.
        // We reuse the same queue for errors.
        request.clientRenderedBoundaries.push(boundary);
      }
    }
  }

  request.allPendingTasks--;

  if (request.allPendingTasks === 0) {
    var onAllReady = request.onAllReady;
    onAllReady();
  }
}

function abortTaskSoft(task) {
  // This aborts task without aborting the parent boundary that it blocks.
  // It's used for when we didn't need this task to complete the tree.
  // If task was needed, then it should use abortTask instead.
  var request = this;
  var boundary = task.blockedBoundary;
  var segment = task.blockedSegment;
  segment.status = ABORTED;
  finishedTask(request, boundary, segment);
}

function abortTask(task, request, error) {
  // This aborts the task and aborts the parent that it blocks, putting it into
  // client rendered mode.
  var boundary = task.blockedBoundary;
  var segment = task.blockedSegment;
  segment.status = ABORTED;

  if (boundary === null) {
    request.allPendingTasks--; // We didn't complete the root so we have nothing to show. We can close
    // the request;

    if (request.status !== CLOSING && request.status !== CLOSED) {
      logRecoverableError(request, error);
      fatalError(request, error);
    }
  } else {
    boundary.pendingTasks--;

    if (!boundary.forceClientRender) {
      boundary.forceClientRender = true;
      boundary.errorDigest = request.onError(error);

      {
        var errorPrefix = 'The server did not finish this Suspense boundary: ';
        var errorMessage;

        if (error && typeof error.message === 'string') {
          errorMessage = errorPrefix + error.message;
        } else {
          // eslint-disable-next-line react-internal/safe-string-coercion
          errorMessage = errorPrefix + String(error);
        }

        var previousTaskInDev = currentTaskInDEV;
        currentTaskInDEV = task;

        try {
          captureBoundaryErrorDetailsDev(boundary, errorMessage);
        } finally {
          currentTaskInDEV = previousTaskInDev;
        }
      }

      if (boundary.parentFlushed) {
        request.clientRenderedBoundaries.push(boundary);
      }
    } // If this boundary was still pending then we haven't already cancelled its fallbacks.
    // We'll need to abort the fallbacks, which will also error that parent boundary.


    boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
      return abortTask(fallbackTask, request, error);
    });
    boundary.fallbackAbortableTasks.clear();
    request.allPendingTasks--;

    if (request.allPendingTasks === 0) {
      var onAllReady = request.onAllReady;
      onAllReady();
    }
  }
}

function queueCompletedSegment(boundary, segment) {
  if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null) {
    // This is an empty segment. There's nothing to write, so we can instead transfer the ID
    // to the child. That way any existing references point to the child.
    var childSegment = segment.children[0];
    childSegment.id = segment.id;
    childSegment.parentFlushed = true;

    if (childSegment.status === COMPLETED) {
      queueCompletedSegment(boundary, childSegment);
    }
  } else {
    var completedSegments = boundary.completedSegments;
    completedSegments.push(segment);
  }
}

function finishedTask(request, boundary, segment) {
  if (boundary === null) {
    if (segment.parentFlushed) {
      if (request.completedRootSegment !== null) {
        throw new Error('There can only be one root segment. This is a bug in React.');
      }

      request.completedRootSegment = segment;
    }

    request.pendingRootTasks--;

    if (request.pendingRootTasks === 0) {
      // We have completed the shell so the shell can't error anymore.
      request.onShellError = noop$1;
      var onShellReady = request.onShellReady;
      onShellReady();
    }
  } else {
    boundary.pendingTasks--;

    if (boundary.forceClientRender) ; else if (boundary.pendingTasks === 0) {
      // This must have been the last segment we were waiting on. This boundary is now complete.
      if (segment.parentFlushed) {
        // Our parent segment already flushed, so we need to schedule this segment to be emitted.
        // If it is a segment that was aborted, we'll write other content instead so we don't need
        // to emit it.
        if (segment.status === COMPLETED) {
          queueCompletedSegment(boundary, segment);
        }
      }

      {
        hoistCompletedBoundaryResources(request, boundary);
      }

      if (boundary.parentFlushed) {
        // The segment might be part of a segment that didn't flush yet, but if the boundary's
        // parent flushed, we need to schedule the boundary to be emitted.
        request.completedBoundaries.push(boundary);
      } // We can now cancel any pending task on the fallback since we won't need to show it anymore.
      // This needs to happen after we read the parentFlushed flags because aborting can finish
      // work which can trigger user code, which can start flushing, which can change those flags.


      boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
      boundary.fallbackAbortableTasks.clear();
    } else {
      if (segment.parentFlushed) {
        // Our parent already flushed, so we need to schedule this segment to be emitted.
        // If it is a segment that was aborted, we'll write other content instead so we don't need
        // to emit it.
        if (segment.status === COMPLETED) {
          queueCompletedSegment(boundary, segment);
          var completedSegments = boundary.completedSegments;

          if (completedSegments.length === 1) {
            // This is the first time since we last flushed that we completed anything.
            // We can schedule this boundary to emit its partially completed segments early
            // in case the parent has already been flushed.
            if (boundary.parentFlushed) {
              request.partialBoundaries.push(boundary);
            }
          }
        }
      }
    }
  }

  request.allPendingTasks--;

  if (request.allPendingTasks === 0) {
    // This needs to be called at the very end so that we can synchronously write the result
    // in the callback if needed.
    var onAllReady = request.onAllReady;
    onAllReady();
  }
}

function retryTask(request, task) {
  {
    var blockedBoundary = task.blockedBoundary;
    setCurrentlyRenderingBoundaryResourcesTarget(request.resources, blockedBoundary ? blockedBoundary.resources : null);
  }

  var segment = task.blockedSegment;

  if (segment.status !== PENDING) {
    // We completed this by other means before we had a chance to retry it.
    return;
  } // We restore the context to what it was when we suspended.
  // We don't restore it after we leave because it's likely that we'll end up
  // needing a very similar context soon again.


  switchContext(task.context);
  var prevTaskInDEV = null;

  {
    prevTaskInDEV = currentTaskInDEV;
    currentTaskInDEV = task;
  }

  try {
    // We call the destructive form that mutates this task. That way if something
    // suspends again, we can reuse the same task instead of spawning a new one.
    // Reset the task's thenable state before continuing, so that if a later
    // component suspends we can reuse the same task object. If the same
    // component suspends again, the thenable state will be restored.
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    renderNodeDestructive(request, task, prevThenableState, task.node);
    pushSegmentFinale(segment.chunks, request.responseState, segment.lastPushedText, segment.textEmbedded);
    task.abortSet.delete(task);
    segment.status = COMPLETED;
    finishedTask(request, task.blockedBoundary, segment);
  } catch (x) {
    resetHooksState();

    if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
      // Something suspended again, let's pick it back up later.
      var ping = task.ping;
      x.then(ping, ping);
      var wakeable = x;
      trackSuspendedWakeable(wakeable);
      task.thenableState = getThenableStateAfterSuspending();
    } else {
      task.abortSet.delete(task);
      segment.status = ERRORED;
      erroredTask(request, task.blockedBoundary, segment, x);
    }
  } finally {
    {
      setCurrentlyRenderingBoundaryResourcesTarget(request.resources, null);
    }

    {
      currentTaskInDEV = prevTaskInDEV;
    }
  }
}

function performWork(request) {
  if (request.status === CLOSED) {
    return;
  }

  var prevContext = getActiveContext();
  var prevDispatcher = ReactCurrentDispatcher$1.current;
  ReactCurrentDispatcher$1.current = HooksDispatcher;
  var prevCacheDispatcher;

  {
    prevCacheDispatcher = ReactCurrentCache.current;
    ReactCurrentCache.current = DefaultCacheDispatcher;
  }

  var previousHostDispatcher = prepareToRender(request.resources);
  var prevGetCurrentStackImpl;

  {
    prevGetCurrentStackImpl = ReactDebugCurrentFrame$1.getCurrentStack;
    ReactDebugCurrentFrame$1.getCurrentStack = getCurrentStackInDEV;
  }

  var prevResponseState = currentResponseState;
  setCurrentResponseState(request.responseState);

  try {
    var pingedTasks = request.pingedTasks;
    var i;

    for (i = 0; i < pingedTasks.length; i++) {
      var task = pingedTasks[i];
      retryTask(request, task);
    }

    pingedTasks.splice(0, i);

    if (request.destination !== null) {
      flushCompletedQueues(request, request.destination);
    }
  } catch (error) {
    logRecoverableError(request, error);
    fatalError(request, error);
  } finally {
    setCurrentResponseState(prevResponseState);
    ReactCurrentDispatcher$1.current = prevDispatcher;

    {
      ReactCurrentCache.current = prevCacheDispatcher;
    }

    cleanupAfterRender(previousHostDispatcher);

    {
      ReactDebugCurrentFrame$1.getCurrentStack = prevGetCurrentStackImpl;
    }

    if (prevDispatcher === HooksDispatcher) {
      // This means that we were in a reentrant work loop. This could happen
      // in a renderer that supports synchronous work like renderToString,
      // when it's called from within another renderer.
      // Normally we don't bother switching the contexts to their root/default
      // values when leaving because we'll likely need the same or similar
      // context again. However, when we're inside a synchronous loop like this
      // we'll to restore the context to what it was before returning.
      switchContext(prevContext);
    }
  }
}

function flushSubtree(request, destination, segment) {
  segment.parentFlushed = true;

  switch (segment.status) {
    case PENDING:
      {
        // We're emitting a placeholder for this segment to be filled in later.
        // Therefore we'll need to assign it an ID - to refer to it by.
        var segmentID = segment.id = request.nextSegmentId++; // When this segment finally completes it won't be embedded in text since it will flush separately

        segment.lastPushedText = false;
        segment.textEmbedded = false;
        return writePlaceholder(destination, request.responseState, segmentID);
      }

    case COMPLETED:
      {
        segment.status = FLUSHED;
        var r = true;
        var chunks = segment.chunks;
        var chunkIdx = 0;
        var children = segment.children;

        for (var childIdx = 0; childIdx < children.length; childIdx++) {
          var nextChild = children[childIdx]; // Write all the chunks up until the next child.

          for (; chunkIdx < nextChild.index; chunkIdx++) {
            writeChunk(destination, chunks[chunkIdx]);
          }

          r = flushSegment(request, destination, nextChild);
        } // Finally just write all the remaining chunks


        for (; chunkIdx < chunks.length - 1; chunkIdx++) {
          writeChunk(destination, chunks[chunkIdx]);
        }

        if (chunkIdx < chunks.length) {
          r = writeChunkAndReturn(destination, chunks[chunkIdx]);
        }

        return r;
      }

    default:
      {
        throw new Error('Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.');
      }
  }
}

function flushSegment(request, destination, segment) {
  var boundary = segment.boundary;

  if (boundary === null) {
    // Not a suspense boundary.
    return flushSubtree(request, destination, segment);
  }

  boundary.parentFlushed = true; // This segment is a Suspense boundary. We need to decide whether to
  // emit the content or the fallback now.

  if (boundary.forceClientRender) {
    // Emit a client rendered suspense boundary wrapper.
    // We never queue the inner boundary so we'll never emit its content or partial segments.
    writeStartClientRenderedSuspenseBoundary(destination, request.responseState, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack); // Flush the fallback.

    flushSubtree(request, destination, segment);
    return writeEndClientRenderedSuspenseBoundary(destination, request.responseState);
  } else if (boundary.pendingTasks > 0) {
    // This boundary is still loading. Emit a pending suspense boundary wrapper.
    // Assign an ID to refer to the future content by.
    boundary.rootSegmentID = request.nextSegmentId++;

    if (boundary.completedSegments.length > 0) {
      // If this is at least partially complete, we can queue it to be partially emitted early.
      request.partialBoundaries.push(boundary);
    } /// This is the first time we should have referenced this ID.


    var id = boundary.id = assignSuspenseBoundaryID(request.responseState);
    writeStartPendingSuspenseBoundary(destination, request.responseState, id); // Flush the fallback.

    flushSubtree(request, destination, segment);
    return writeEndPendingSuspenseBoundary(destination, request.responseState);
  } else if (boundary.byteSize > request.progressiveChunkSize) {
    // This boundary is large and will be emitted separately so that we can progressively show
    // other content. We add it to the queue during the flush because we have to ensure that
    // the parent flushes first so that there's something to inject it into.
    // We also have to make sure that it's emitted into the queue in a deterministic slot.
    // I.e. we can't insert it here when it completes.
    // Assign an ID to refer to the future content by.
    boundary.rootSegmentID = request.nextSegmentId++;
    request.completedBoundaries.push(boundary); // Emit a pending rendered suspense boundary wrapper.

    writeStartPendingSuspenseBoundary(destination, request.responseState, boundary.id); // Flush the fallback.

    flushSubtree(request, destination, segment);
    return writeEndPendingSuspenseBoundary(destination, request.responseState);
  } else {
    {
      hoistResources(request.resources, boundary.resources);
    } // We can inline this boundary's content as a complete boundary.


    writeStartCompletedSuspenseBoundary(destination, request.responseState);
    var completedSegments = boundary.completedSegments;

    if (completedSegments.length !== 1) {
      throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
    }

    var contentSegment = completedSegments[0];
    flushSegment(request, destination, contentSegment);
    return writeEndCompletedSuspenseBoundary(destination, request.responseState);
  }
}

function flushInitialResources(destination, resources, responseState) {
  writeInitialResources(destination, resources, responseState);
}

function flushImmediateResources(destination, request) {
  writeImmediateResources(destination, request.resources, request.responseState);
}

function flushClientRenderedBoundary(request, destination, boundary) {
  return writeClientRenderBoundaryInstruction(destination, request.responseState, boundary.id, boundary.errorDigest, boundary.errorMessage, boundary.errorComponentStack);
}

function flushSegmentContainer(request, destination, segment) {
  writeStartSegment(destination, request.responseState, segment.formatContext, segment.id);
  flushSegment(request, destination, segment);
  return writeEndSegment(destination, segment.formatContext);
}

function flushCompletedBoundary(request, destination, boundary) {
  {
    setCurrentlyRenderingBoundaryResourcesTarget(request.resources, boundary.resources);
  }

  var completedSegments = boundary.completedSegments;
  var i = 0;

  for (; i < completedSegments.length; i++) {
    var segment = completedSegments[i];
    flushPartiallyCompletedSegment(request, destination, boundary, segment);
  }

  completedSegments.length = 0;
  return writeCompletedBoundaryInstruction(destination, request.responseState, boundary.id, boundary.rootSegmentID, boundary.resources);
}

function flushPartialBoundary(request, destination, boundary) {
  {
    setCurrentlyRenderingBoundaryResourcesTarget(request.resources, boundary.resources);
  }

  var completedSegments = boundary.completedSegments;
  var i = 0;

  for (; i < completedSegments.length; i++) {
    var segment = completedSegments[i];

    if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
      i++;
      completedSegments.splice(0, i); // Only write as much as the buffer wants. Something higher priority
      // might want to write later.

      return false;
    }
  }

  completedSegments.splice(0, i);
  return true;
}

function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
  if (segment.status === FLUSHED) {
    // We've already flushed this inline.
    return true;
  }

  var segmentID = segment.id;

  if (segmentID === -1) {
    // This segment wasn't previously referred to. This happens at the root of
    // a boundary. We make kind of a leap here and assume this is the root.
    var rootSegmentID = segment.id = boundary.rootSegmentID;

    if (rootSegmentID === -1) {
      throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');
    }

    return flushSegmentContainer(request, destination, segment);
  } else {
    flushSegmentContainer(request, destination, segment);
    return writeCompletedSegmentInstruction(destination, request.responseState, segmentID);
  }
}

function flushCompletedQueues(request, destination) {
  beginWriting();

  try {
    // The structure of this is to go through each queue one by one and write
    // until the sink tells us to stop. When we should stop, we still finish writing
    // that item fully and then yield. At that point we remove the already completed
    // items up until the point we completed them.
    var i;
    var completedRootSegment = request.completedRootSegment;

    if (completedRootSegment !== null) {
      if (request.pendingRootTasks === 0) {
        if (enableFloat) {
          var preamble = request.preamble;

          for (i = 0; i < preamble.length; i++) {
            // we expect the preamble to be tiny and will ignore backpressure
            writeChunk(destination, preamble[i]);
          }

          flushInitialResources(destination, request.resources, request.responseState);
        }

        flushSegment(request, destination, completedRootSegment);
        request.completedRootSegment = null;
        writeCompletedRoot(destination, request.responseState);
      } else {
        // We haven't flushed the root yet so we don't need to check any other branches further down
        return;
      }
    } else if (enableFloat) {
      flushImmediateResources(destination, request);
    } // We emit client rendering instructions for already emitted boundaries first.
    // This is so that we can signal to the client to start client rendering them as
    // soon as possible.


    var clientRenderedBoundaries = request.clientRenderedBoundaries;

    for (i = 0; i < clientRenderedBoundaries.length; i++) {
      var boundary = clientRenderedBoundaries[i];

      if (!flushClientRenderedBoundary(request, destination, boundary)) {
        request.destination = null;
        i++;
        clientRenderedBoundaries.splice(0, i);
        return;
      }
    }

    clientRenderedBoundaries.splice(0, i); // Next we emit any complete boundaries. It's better to favor boundaries
    // that are completely done since we can actually show them, than it is to emit
    // any individual segments from a partially complete boundary.

    var completedBoundaries = request.completedBoundaries;

    for (i = 0; i < completedBoundaries.length; i++) {
      var _boundary = completedBoundaries[i];

      if (!flushCompletedBoundary(request, destination, _boundary)) {
        request.destination = null;
        i++;
        completedBoundaries.splice(0, i);
        return;
      }
    }

    completedBoundaries.splice(0, i); // Allow anything written so far to flush to the underlying sink before
    // we continue with lower priorities.

    completeWriting(destination);
    beginWriting(destination); // TODO: Here we'll emit data used by hydration.
    // Next we emit any segments of any boundaries that are partially complete
    // but not deeply complete.

    var partialBoundaries = request.partialBoundaries;

    for (i = 0; i < partialBoundaries.length; i++) {
      var _boundary2 = partialBoundaries[i];

      if (!flushPartialBoundary(request, destination, _boundary2)) {
        request.destination = null;
        i++;
        partialBoundaries.splice(0, i);
        return;
      }
    }

    partialBoundaries.splice(0, i); // Next we check the completed boundaries again. This may have had
    // boundaries added to it in case they were too larged to be inlined.
    // New ones might be added in this loop.

    var largeBoundaries = request.completedBoundaries;

    for (i = 0; i < largeBoundaries.length; i++) {
      var _boundary3 = largeBoundaries[i];

      if (!flushCompletedBoundary(request, destination, _boundary3)) {
        request.destination = null;
        i++;
        largeBoundaries.splice(0, i);
        return;
      }
    }

    largeBoundaries.splice(0, i);
  } finally {
    if (request.allPendingTasks === 0 && request.pingedTasks.length === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0 // We don't need to check any partially completed segments because
    // either they have pending task or they're complete.
    ) {
        {
          var postamble = request.postamble;

          for (var _i = 0; _i < postamble.length; _i++) {
            writeChunk(destination, postamble[_i]);
          }
        }

        completeWriting(destination);

        {
          if (request.abortableTasks.size !== 0) {
            error('There was still abortable task at the root when we closed. This is a bug in React.');
          }
        } // We're done.


        close(destination);
      } else {
      completeWriting(destination);
    }
  }
}

function startWork(request) {
  scheduleWork(function () {
    return performWork(request);
  });
}
function startFlowing(request, destination) {
  if (request.status === CLOSING) {
    request.status = CLOSED;
    closeWithError(destination, request.fatalError);
    return;
  }

  if (request.status === CLOSED) {
    return;
  }

  if (request.destination !== null) {
    // We're already flowing.
    return;
  }

  request.destination = destination;

  try {
    flushCompletedQueues(request, destination);
  } catch (error) {
    logRecoverableError(request, error);
    fatalError(request, error);
  }
} // This is called to early terminate a request. It puts all pending boundaries in client rendered state.

function abort(request, reason) {
  try {
    var abortableTasks = request.abortableTasks;

    if (abortableTasks.size > 0) {
      var _error = reason === undefined ? new Error('The render was aborted by the server without a reason.') : reason;

      abortableTasks.forEach(function (task) {
        return abortTask(task, request, _error);
      });
      abortableTasks.clear();
    }

    if (request.destination !== null) {
      flushCompletedQueues(request, request.destination);
    }
  } catch (error) {
    logRecoverableError(request, error);
    fatalError(request, error);
  }
}

function prerender(children, options) {
  return new Promise(function (resolve, reject) {
    var onFatalError = reject;

    function onAllReady() {
      var stream = new ReadableStream({
        type: 'bytes',
        pull: function (controller) {
          startFlowing(request, controller);
        }
      }, // $FlowFixMe size() methods are not allowed on byte streams.
      {
        highWaterMark: 0
      });
      var result = {
        prelude: stream
      };
      resolve(result);
    }

    var request = createRequest(children, createResponseState(options ? options.identifierPrefix : undefined, undefined, options ? options.bootstrapScriptContent : undefined, options ? options.bootstrapScripts : undefined, options ? options.bootstrapModules : undefined), createRootFormatContext(options ? options.namespaceURI : undefined), options ? options.progressiveChunkSize : undefined, options ? options.onError : undefined, onAllReady, undefined, undefined, onFatalError);

    if (options && options.signal) {
      var signal = options.signal;

      if (signal.aborted) {
        abort(request, signal.reason);
      } else {
        var listener = function () {
          abort(request, signal.reason);
          signal.removeEventListener('abort', listener);
        };

        signal.addEventListener('abort', listener);
      }
    }

    startWork(request);
  });
}

exports.prerender = prerender;
exports.version = ReactVersion;
  })();
}


/***/ }),

/***/ 324:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

/**
 * @license React
 * react-dom-static.browser.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ba=__nccwpck_require__(533),ca=__nccwpck_require__(174);function k(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return"Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var l=null,p=0;
function q(a,b){if(0!==b.length)if(512<b.length)0<p&&(a.enqueue(new Uint8Array(l.buffer,0,p)),l=new Uint8Array(512),p=0),a.enqueue(b);else{var c=l.length-p;c<b.length&&(0===c?a.enqueue(l):(l.set(b.subarray(0,c),p),a.enqueue(l),b=b.subarray(c)),l=new Uint8Array(512),p=0);l.set(b,p);p+=b.length}}function u(a,b){q(a,b);return!0}function da(a){l&&0<p&&(a.enqueue(new Uint8Array(l.buffer,0,p)),l=null,p=0)}var ea=new TextEncoder;function v(a){return ea.encode(a)}function x(a){return ea.encode(a)}
function fa(a,b){"function"===typeof a.error?a.error(b):a.close()}var y=Object.prototype.hasOwnProperty,ha=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ia={},ja={};
function ka(a){if(y.call(ja,a))return!0;if(y.call(ia,a))return!1;if(ha.test(a))return ja[a]=!0;ia[a]=!0;return!1}function A(a,b,c,d,e,f,g){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;this.removeEmptyString=g}var B={},la="children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ");
la.push("innerText","textContent");la.forEach(function(a){B[a]=new A(a,0,!1,a,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];B[b]=new A(b,1,!1,a[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(a){B[a]=new A(a,2,!1,a.toLowerCase(),null,!1,!1)});
["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){B[a]=new A(a,2,!1,a,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){B[a]=new A(a,3,!1,a.toLowerCase(),null,!1,!1)});
["checked","multiple","muted","selected"].forEach(function(a){B[a]=new A(a,3,!0,a,null,!1,!1)});["capture","download"].forEach(function(a){B[a]=new A(a,4,!1,a,null,!1,!1)});["cols","rows","size","span"].forEach(function(a){B[a]=new A(a,6,!1,a,null,!1,!1)});["rowSpan","start"].forEach(function(a){B[a]=new A(a,5,!1,a.toLowerCase(),null,!1,!1)});var ma=/[\-:]([a-z])/g;function na(a){return a[1].toUpperCase()}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(ma,
na);B[b]=new A(b,1,!1,a,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(ma,na);B[b]=new A(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(ma,na);B[b]=new A(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(a){B[a]=new A(a,1,!1,a.toLowerCase(),null,!1,!1)});
B.xlinkHref=new A("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){B[a]=new A(a,1,!1,a.toLowerCase(),null,!0,!0)});
var oa={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,
zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},pa=["Webkit","ms","Moz","O"];Object.keys(oa).forEach(function(a){pa.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);oa[b]=oa[a]})});var qa=/["'&<>]/;
function E(a){if("boolean"===typeof a||"number"===typeof a)return""+a;a=""+a;var b=qa.exec(a);if(b){var c="",d,e=0;for(d=b.index;d<a.length;d++){switch(a.charCodeAt(d)){case 34:b="&quot;";break;case 38:b="&amp;";break;case 39:b="&#x27;";break;case 60:b="&lt;";break;case 62:b="&gt;";break;default:continue}e!==d&&(c+=a.substring(e,d));e=d+1;c+=b}a=e!==d?c+a.substring(e,d):c}return a}var ra=/([A-Z])/g,sa=/^ms-/,ta=Array.isArray,F=Object.assign;
function ua(a,b){b.forEach(function(b){return a.add(b)})}var G=null,va=[],za={preload:wa,preinit:ya};function wa(a,b){if(G&&"string"===typeof a&&a&&"object"===typeof b&&null!==b){var c=b.as,d=G.preloadsMap.get(a);d||(d=Aa(G,a,c,{href:a,rel:"preload",as:c,crossOrigin:"font"===c?"":b.crossOrigin,integrity:b.integrity}));G.explicitPreloads.add(d)}}
function ya(a,b){if(G&&"string"===typeof a&&a&&"object"===typeof b&&null!==b)switch(b.as){case "style":var c=b.precedence||"default",d=G.stylesMap.get(a);d||(d=Ba(G,a,c,{rel:"stylesheet",href:a,"data-rprec":c,crossOrigin:b.crossOrigin}));Ca(G,null,d)}}function Da(a,b){return{rel:"preload",as:"style",href:a,crossOrigin:b.crossOrigin,integrity:b.integrity,media:b.media,hrefLang:b.hrefLang,referrerPolicy:b.referrerPolicy}}
function Aa(a,b,c,d){c={type:"preload",as:c,href:b,flushed:!1,props:d};a.preloadsMap.set(b,c);return c}
function Ba(a,b,c,d){var e=a.stylesMap,f=a.preloadsMap.get(b);f?(a=f.props,null==d.crossOrigin&&(d.crossOrigin=a.crossOrigin),null==d.referrerPolicy&&(d.referrerPolicy=a.referrerPolicy),null==d.media&&(d.media=a.media),null==d.title&&(d.title=a.title)):(f=Da(b,d),f=Aa(a,b,"style",f),a.implicitPreloads.add(f));c={type:"style",href:b,precedence:c,flushed:!1,inShell:!1,props:d,hint:f};e.set(b,c);return c}
function Ca(a,b,c){a=a.precedences;var d=c.precedence;b?(b.add(c),a.has(d)||a.set(d,new Set)):(b=a.get(d),b||(b=new Set,a.set(d,b)),b.add(c))}
function Ea(a){if(!G)throw Error(k(445));var b=a.href;if(!b||"string"!==typeof b)return!1;switch(a.rel){case "stylesheet":var c=a.onLoad,d=a.onError,e=a.precedence,f=a.disabled;if("string"!==typeof e||c||d||null!=f){(e=G.preloadsMap.get(b))||(e=Aa(G,b,"style",Da(b,a)));G.implicitPreloads.add(e);break}else return c=G.stylesMap.get(b),c||(a=F({},a),a.href=b,a.rel="stylesheet",a["data-rprec"]=e,delete a.precedence,c=Ba(G,b,e,a)),Ca(G,G.boundaryResources,c),!0;case "preload":if(e=a.as,c=a.onError,!a.onLoad&&
!c)switch(e){case "script":case "style":case "font":return c=G.preloadsMap.get(b),c||(c=G,a=F({},a),a.href=b,a.rel="preload",a.as=e,"font"===e&&(a.crossOrigin=""),c=Aa(c,b,e,a)),G.explicitPreloads.add(c),!0}}return!1}function Fa(a,b){b.forEach(function(b){a.precedences.get(b.precedence).add(b)});b.clear()}
var Ga=ca.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Dispatcher,Ha=x("<script>"),Ia=x("\x3c/script>"),Ja=x('<script src="'),Ka=x('<script type="module" src="'),La=x('" integrity="'),Ma=x('" async="">\x3c/script>'),Na=/(<\/|<)(s)(cript)/gi;function Oa(a,b,c,d){return""+b+("s"===c?"\\u0073":"\\u0053")+d}
function Pa(a,b,c,d,e){a=void 0===a?"":a;b=void 0===b?Ha:x('<script nonce="'+E(b)+'">');var f=[];void 0!==c&&f.push(b,v((""+c).replace(Na,Oa)),Ia);if(void 0!==d)for(c=0;c<d.length;c++){var g=d[c],h="string"===typeof g?void 0:g.integrity;f.push(Ja,v(E("string"===typeof g?g:g.src)));h&&f.push(La,v(E(h)));f.push(Ma)}if(void 0!==e)for(d=0;d<e.length;d++)c=e[d],g="string"===typeof c?void 0:c.integrity,f.push(Ka,v(E("string"===typeof c?c:c.src))),g&&f.push(La,v(E(g))),f.push(Ma);return{bootstrapChunks:f,
startInlineScript:b,placeholderPrefix:x(a+"P:"),segmentPrefix:x(a+"S:"),boundaryPrefix:a+"B:",idPrefix:a,nextSuspenseID:0,sentCompleteSegmentFunction:!1,sentCompleteBoundaryFunction:!1,sentClientRenderFunction:!1,sentStyleInsertionFunction:!1}}function H(a,b){return{insertionMode:a,selectedValue:b}}function Qa(a){return H("http://www.w3.org/2000/svg"===a?2:"http://www.w3.org/1998/Math/MathML"===a?3:0,null)}
function Ra(a,b,c){switch(b){case "select":return H(1,null!=c.value?c.value:c.defaultValue);case "svg":return H(2,null);case "math":return H(3,null);case "foreignObject":return H(1,null);case "table":return H(4,null);case "thead":case "tbody":case "tfoot":return H(5,null);case "colgroup":return H(7,null);case "tr":return H(6,null)}return 4<=a.insertionMode||0===a.insertionMode?H(1,null):a}var Sa=x("\x3c!-- --\x3e");function Ta(a,b,c,d){if(""===b)return d;d&&a.push(Sa);a.push(v(E(b)));return!0}
var Ua=new Map,Va=x(' style="'),Wa=x(":"),Xa=x(";");
function Ya(a,b,c){if("object"!==typeof c)throw Error(k(62));b=!0;for(var d in c)if(y.call(c,d)){var e=c[d];if(null!=e&&"boolean"!==typeof e&&""!==e){if(0===d.indexOf("--")){var f=v(E(d));e=v(E((""+e).trim()))}else{f=d;var g=Ua.get(f);void 0!==g?f=g:(g=x(E(f.replace(ra,"-$1").toLowerCase().replace(sa,"-ms-"))),Ua.set(f,g),f=g);e="number"===typeof e?0===e||y.call(oa,d)?v(""+e):v(e+"px"):v(E((""+e).trim()))}b?(b=!1,a.push(Va,f,Wa,e)):a.push(Xa,f,Wa,e)}}b||a.push(I)}
var J=x(" "),K=x('="'),I=x('"'),Za=x('=""');
function L(a,b,c,d){switch(c){case "style":Ya(a,b,d);return;case "defaultValue":case "defaultChecked":case "innerHTML":case "suppressContentEditableWarning":case "suppressHydrationWarning":return}if(!(2<c.length)||"o"!==c[0]&&"O"!==c[0]||"n"!==c[1]&&"N"!==c[1])if(b=B.hasOwnProperty(c)?B[c]:null,null!==b){switch(typeof d){case "function":case "symbol":return;case "boolean":if(!b.acceptsBooleans)return}c=v(b.attributeName);switch(b.type){case 3:d&&a.push(J,c,Za);break;case 4:!0===d?a.push(J,c,Za):!1!==
d&&a.push(J,c,K,v(E(d)),I);break;case 5:isNaN(d)||a.push(J,c,K,v(E(d)),I);break;case 6:!isNaN(d)&&1<=d&&a.push(J,c,K,v(E(d)),I);break;default:b.sanitizeURL&&(d=""+d),a.push(J,c,K,v(E(d)),I)}}else if(ka(c)){switch(typeof d){case "function":case "symbol":return;case "boolean":if(b=c.toLowerCase().slice(0,5),"data-"!==b&&"aria-"!==b)return}a.push(J,v(c),K,v(E(d)),I)}}var M=x(">"),$a=x("/>");
function ab(a,b,c){if(null!=b){if(null!=c)throw Error(k(60));if("object"!==typeof b||!("__html"in b))throw Error(k(61));b=b.__html;null!==b&&void 0!==b&&a.push(v(""+b))}}function bb(a){var b="";ba.Children.forEach(a,function(a){null!=a&&(b+=a)});return b}var cb=x(' selected=""');
function O(a,b,c){var d="stylesheet"===b.rel;a.push(P("link"));for(var e in b)if(y.call(b,e)){var f=b[e];if(null!=f)switch(e){case "children":case "dangerouslySetInnerHTML":throw Error(k(399,"link"));case "precedence":if(d)continue;default:L(a,c,e,f)}}a.push($a);return null}
function db(a,b,c,d){a.push(P(c));var e=c=null,f;for(f in b)if(y.call(b,f)){var g=b[f];if(null!=g)switch(f){case "children":c=g;break;case "dangerouslySetInnerHTML":e=g;break;default:L(a,d,f,g)}}a.push(M);ab(a,e,c);return"string"===typeof c?(a.push(v(E(c))),null):c}var eb=x("\n"),fb=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,gb=new Map;function P(a){var b=gb.get(a);if(void 0===b){if(!fb.test(a))throw Error(k(65,a));b=x("<"+a);gb.set(a,b)}return b}var hb=x("<!DOCTYPE html>");
function ib(a,b,c,d,e,f,g){switch(c){case "select":a.push(P("select"));var h=null,m=null;for(w in d)if(y.call(d,w)){var n=d[w];if(null!=n)switch(w){case "children":h=n;break;case "dangerouslySetInnerHTML":m=n;break;case "defaultValue":case "value":break;default:L(a,e,w,n)}}a.push(M);ab(a,m,h);return h;case "option":m=f.selectedValue;a.push(P("option"));var t=n=null,r=null;var w=null;for(h in d)if(y.call(d,h)){var z=d[h];if(null!=z)switch(h){case "children":n=z;break;case "selected":r=z;break;case "dangerouslySetInnerHTML":w=
z;break;case "value":t=z;default:L(a,e,h,z)}}if(null!=m)if(d=null!==t?""+t:bb(n),ta(m))for(e=0;e<m.length;e++){if(""+m[e]===d){a.push(cb);break}}else""+m===d&&a.push(cb);else r&&a.push(cb);a.push(M);ab(a,w,n);return n;case "textarea":a.push(P("textarea"));w=m=h=null;for(n in d)if(y.call(d,n)&&(t=d[n],null!=t))switch(n){case "children":w=t;break;case "value":h=t;break;case "defaultValue":m=t;break;case "dangerouslySetInnerHTML":throw Error(k(91));default:L(a,e,n,t)}null===h&&null!==m&&(h=m);a.push(M);
if(null!=w){if(null!=h)throw Error(k(92));if(ta(w)&&1<w.length)throw Error(k(93));h=""+w}"string"===typeof h&&"\n"===h[0]&&a.push(eb);null!==h&&a.push(v(E(""+h)));return null;case "input":a.push(P("input"));t=w=n=h=null;for(m in d)if(y.call(d,m)&&(r=d[m],null!=r))switch(m){case "children":case "dangerouslySetInnerHTML":throw Error(k(399,"input"));case "defaultChecked":t=r;break;case "defaultValue":n=r;break;case "checked":w=r;break;case "value":h=r;break;default:L(a,e,m,r)}null!==w?L(a,e,"checked",
w):null!==t&&L(a,e,"checked",t);null!==h?L(a,e,"value",h):null!==n&&L(a,e,"value",n);a.push($a);return null;case "menuitem":a.push(P("menuitem"));for(var C in d)if(y.call(d,C)&&(h=d[C],null!=h))switch(C){case "children":case "dangerouslySetInnerHTML":throw Error(k(400));default:L(a,e,C,h)}a.push(M);return null;case "title":a.push(P("title"));h=null;for(z in d)if(y.call(d,z)&&(m=d[z],null!=m))switch(z){case "children":h=m;break;case "dangerouslySetInnerHTML":throw Error(k(434));default:L(a,e,z,m)}a.push(M);
return h;case "link":return Ea(d)?(g&&a.push(Sa),a=null):a=O(a,d,e),a;case "listing":case "pre":a.push(P(c));m=h=null;for(t in d)if(y.call(d,t)&&(n=d[t],null!=n))switch(t){case "children":h=n;break;case "dangerouslySetInnerHTML":m=n;break;default:L(a,e,t,n)}a.push(M);if(null!=m){if(null!=h)throw Error(k(60));if("object"!==typeof m||!("__html"in m))throw Error(k(61));d=m.__html;null!==d&&void 0!==d&&("string"===typeof d&&0<d.length&&"\n"===d[0]?a.push(eb,v(d)):a.push(v(""+d)))}"string"===typeof h&&
"\n"===h[0]&&a.push(eb);return h;case "area":case "base":case "br":case "col":case "embed":case "hr":case "img":case "keygen":case "meta":case "param":case "source":case "track":case "wbr":a.push(P(c));for(var D in d)if(y.call(d,D)&&(h=d[D],null!=h))switch(D){case "children":case "dangerouslySetInnerHTML":throw Error(k(399,c));default:L(a,e,D,h)}a.push($a);return null;case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return db(a,
d,c,e);case "head":return db(b,d,c,e);case "html":return 0===f.insertionMode&&b.push(hb),db(b,d,c,e);default:if(-1===c.indexOf("-")&&"string"!==typeof d.is)return db(a,d,c,e);a.push(P(c));m=h=null;for(r in d)if(y.call(d,r)&&(n=d[r],null!=n&&"function"!==typeof n&&"object"!==typeof n&&!1!==n))switch(!0===n&&(n=""),"className"===r&&(r="class"),r){case "children":h=n;break;case "dangerouslySetInnerHTML":m=n;break;case "style":Ya(a,e,n);break;case "suppressContentEditableWarning":case "suppressHydrationWarning":break;
default:ka(r)&&"function"!==typeof n&&"symbol"!==typeof n&&a.push(J,v(r),K,v(E(n)),I)}a.push(M);ab(a,m,h);return h}}var jb=x("</"),kb=x(">"),lb=x('<template id="'),mb=x('"></template>'),nb=x("\x3c!--$--\x3e"),ob=x('\x3c!--$?--\x3e<template id="'),pb=x('"></template>'),qb=x("\x3c!--$!--\x3e"),rb=x("\x3c!--/$--\x3e"),sb=x("<template"),tb=x('"'),ub=x(' data-dgst="');x(' data-msg="');x(' data-stck="');var vb=x("></template>");
function wb(a,b,c){q(a,ob);if(null===c)throw Error(k(395));q(a,c);return u(a,pb)}
var xb=x('<div hidden id="'),yb=x('">'),zb=x("</div>"),Ab=x('<svg aria-hidden="true" style="display:none" id="'),Bb=x('">'),Cb=x("</svg>"),Db=x('<math aria-hidden="true" style="display:none" id="'),Eb=x('">'),Fb=x("</math>"),Gb=x('<table hidden id="'),Hb=x('">'),Ib=x("</table>"),Jb=x('<table hidden><tbody id="'),Kb=x('">'),Lb=x("</tbody></table>"),Mb=x('<table hidden><tr id="'),Nb=x('">'),Ob=x("</tr></table>"),Pb=x('<table hidden><colgroup id="'),Qb=x('">'),Rb=x("</colgroup></table>");
function Sb(a,b,c,d){switch(c.insertionMode){case 0:case 1:return q(a,xb),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,yb);case 2:return q(a,Ab),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Bb);case 3:return q(a,Db),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Eb);case 4:return q(a,Gb),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Hb);case 5:return q(a,Jb),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Kb);case 6:return q(a,Mb),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Nb);case 7:return q(a,
Pb),q(a,b.segmentPrefix),q(a,v(d.toString(16))),u(a,Qb);default:throw Error(k(397));}}function Tb(a,b){switch(b.insertionMode){case 0:case 1:return u(a,zb);case 2:return u(a,Cb);case 3:return u(a,Fb);case 4:return u(a,Ib);case 5:return u(a,Lb);case 6:return u(a,Ob);case 7:return u(a,Rb);default:throw Error(k(397));}}
var Ub=x('function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'),Vb=x('$RS("'),Wb=x('","'),Xb=x('")\x3c/script>'),Yb=x('function $RC(b,c,d){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(d)b.data="$!",a.setAttribute("data-dgst",d);else{d=b.parentNode;a=b.nextSibling;var e=0;do{if(a&&a.nodeType===8){var h=a.data;if(h==="/$")if(0===e)break;else e--;else h!=="$"&&h!=="$?"&&h!=="$!"||e++}h=a.nextSibling;d.removeChild(a);a=h}while(a);for(;c.firstChild;)d.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RC("'),
Zb=x('$RC("'),$b=x('function $RC(b,c,d){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(d)b.data="$!",a.setAttribute("data-dgst",d);else{d=b.parentNode;a=b.nextSibling;var e=0;do{if(a&&a.nodeType===8){var h=a.data;if(h==="/$")if(0===e)break;else e--;else h!=="$"&&h!=="$?"&&h!=="$!"||e++}h=a.nextSibling;d.removeChild(a);a=h}while(a);for(;c.firstChild;)d.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RM=new Map;function $RR(p,q,t){function r(l){this.s=l}for(var m=new Map,n=document,g,e,f=n.querySelectorAll("link[data-rprec]"),d=0;e=f[d++];)m.set(e.dataset.rprec,g=e);e=0;f=[];for(var c,h,b,a;c=t[e++];){var k=0;h=c[k++];if(b=$RM.get(h))"l"!==b.s&&f.push(b);else{a=n.createElement("link");a.href=h;a.rel="stylesheet";for(a.dataset.rprec=d=c[k++];b=c[k++];)a.setAttribute(b,c[k++]);b=a._p=new Promise(function(l,u){a.onload=l;a.onerror=u});b.then(r.bind(b,"l"),r.bind(b,"e"));$RM.set(h,b);f.push(b);c=m.get(d)||g;c===g&&(g=a);m.set(d,a);c?c.parentNode.insertBefore(a,c.nextSibling):(d=n.head,d.insertBefore(a,d.firstChild))}}Promise.all(f).then($RC.bind(null,p,q,""),$RC.bind(null,p,q,"Resource failed to load"))};$RR("'),
ac=x('$RM=new Map;function $RR(p,q,t){function r(l){this.s=l}for(var m=new Map,n=document,g,e,f=n.querySelectorAll("link[data-rprec]"),d=0;e=f[d++];)m.set(e.dataset.rprec,g=e);e=0;f=[];for(var c,h,b,a;c=t[e++];){var k=0;h=c[k++];if(b=$RM.get(h))"l"!==b.s&&f.push(b);else{a=n.createElement("link");a.href=h;a.rel="stylesheet";for(a.dataset.rprec=d=c[k++];b=c[k++];)a.setAttribute(b,c[k++]);b=a._p=new Promise(function(l,u){a.onload=l;a.onerror=u});b.then(r.bind(b,"l"),r.bind(b,"e"));$RM.set(h,b);f.push(b);c=m.get(d)||g;c===g&&(g=a);m.set(d,a);c?c.parentNode.insertBefore(a,c.nextSibling):(d=n.head,d.insertBefore(a,d.firstChild))}}Promise.all(f).then($RC.bind(null,p,q,""),$RC.bind(null,p,q,"Resource failed to load"))};$RR("'),
bc=x('$RR("'),cc=x('","'),dc=x('",'),ec=x('"'),fc=x(")\x3c/script>"),gc=x('function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())};$RX("'),hc=x('$RX("'),ic=x('"'),jc=x(")\x3c/script>"),kc=x(","),lc=/[<\u2028\u2029]/g;
function mc(a){return JSON.stringify(a).replace(lc,function(a){switch(a){case "<":return"\\u003c";case "\u2028":return"\\u2028";case "\u2029":return"\\u2029";default:throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");}})}var nc=/[&><\u2028\u2029]/g;
function oc(a){return JSON.stringify(a).replace(nc,function(a){switch(a){case "&":return"\\u0026";case ">":return"\\u003e";case "<":return"\\u003c";case "\u2028":return"\\u2028";case "\u2029":return"\\u2029";default:throw Error("escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");}})}
function pc(a,b,c){var d=[],e=[],f=b.explicitPreloads,g=b.implicitPreloads;b.precedences.forEach(function(a){a.forEach(function(a){O(e,a.props,c);a.flushed=!0;a.inShell=!0;a.hint.flushed=!0})});f.forEach(function(a){a.flushed||(O(d,a.props,c),a.flushed=!0)});f.clear();g.forEach(function(a){a.flushed||(O(e,a.props,c),a.flushed=!0)});g.clear();f=!0;for(b=0;b<d.length-1;b++)q(a,d[b]);b<d.length&&(f=u(a,d[b]));for(b=0;b<e.length-1;b++)q(a,e[b]);b<e.length&&(f=u(a,e[b]));return f}
function qc(a,b,c){var d=b.explicitPreloads;b=b.implicitPreloads;var e=[];d.forEach(function(a){a.flushed||(O(e,a.props,c),a.flushed=!0)});d.clear();b.forEach(function(a){a.flushed||(O(e,a.props,c),a.flushed=!0)});b.clear();for(d=0;d<e.length-1;d++)q(a,e[d]);return d<e.length?u(a,e[d]):!1}var rc=x("["),sc=x(",["),tc=x(","),uc=x("]");
function vc(a,b){q(a,rc);var c=rc;b.forEach(function(b){if(!b.inShell)if(b.flushed)q(a,c),q(a,v(oc(""+b.href))),q(a,uc),c=sc;else{q(a,c);var d=b.precedence,f=b.props;q(a,v(oc(""+b.href)));d=""+d;q(a,tc);q(a,v(oc(d)));for(var g in f)if(y.call(f,g)){var h=f[g];if(null!=h)switch(g){case "href":case "rel":case "precedence":case "data-rprec":break;case "children":case "dangerouslySetInnerHTML":throw Error(k(399,"link"));default:a:{d=a;var m=g,n=m.toLowerCase();switch(typeof h){case "function":case "symbol":break a}switch(m){case "innerHTML":case "dangerouslySetInnerHTML":case "suppressContentEditableWarning":case "suppressHydrationWarning":case "style":break a;
case "className":n="class";break;case "hidden":if(!1===h)break a;break;case "src":case "href":break;default:if(!ka(m))break a}if(!(2<m.length)||"o"!==m[0]&&"O"!==m[0]||"n"!==m[1]&&"N"!==m[1])h=""+h,q(d,tc),q(d,v(oc(n))),q(d,tc),q(d,v(oc(h)))}}}q(a,uc);c=sc;b.flushed=!0;b.hint.flushed=!0}});q(a,uc)}
var wc=Symbol.for("react.element"),xc=Symbol.for("react.portal"),yc=Symbol.for("react.fragment"),zc=Symbol.for("react.strict_mode"),Ac=Symbol.for("react.profiler"),Bc=Symbol.for("react.provider"),Cc=Symbol.for("react.context"),Dc=Symbol.for("react.server_context"),Ec=Symbol.for("react.forward_ref"),Fc=Symbol.for("react.suspense"),Gc=Symbol.for("react.suspense_list"),Hc=Symbol.for("react.memo"),Ic=Symbol.for("react.lazy"),Jc=Symbol.for("react.scope"),Kc=Symbol.for("react.debug_trace_mode"),Lc=Symbol.for("react.offscreen"),
Mc=Symbol.for("react.legacy_hidden"),Nc=Symbol.for("react.cache"),Oc=Symbol.for("react.default_value"),Pc=Symbol.iterator;
function Qc(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case yc:return"Fragment";case xc:return"Portal";case Ac:return"Profiler";case zc:return"StrictMode";case Fc:return"Suspense";case Gc:return"SuspenseList";case Nc:return"Cache"}if("object"===typeof a)switch(a.$$typeof){case Cc:return(a.displayName||"Context")+".Consumer";case Bc:return(a._context.displayName||"Context")+".Provider";case Ec:var b=a.render;a=a.displayName;
a||(a=b.displayName||b.name||"",a=""!==a?"ForwardRef("+a+")":"ForwardRef");return a;case Hc:return b=a.displayName||null,null!==b?b:Qc(a.type)||"Memo";case Ic:b=a._payload;a=a._init;try{return Qc(a(b))}catch(c){break}case Dc:return(a.displayName||a._globalName)+".Provider"}return null}var Rc=ba.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Sc={};function Tc(a,b){a=a.contextTypes;if(!a)return Sc;var c={},d;for(d in a)c[d]=b[d];return c}var Q=null;
function Uc(a,b){if(a!==b){a.context._currentValue=a.parentValue;a=a.parent;var c=b.parent;if(null===a){if(null!==c)throw Error(k(401));}else{if(null===c)throw Error(k(401));Uc(a,c)}b.context._currentValue=b.value}}function Vc(a){a.context._currentValue=a.parentValue;a=a.parent;null!==a&&Vc(a)}function Wc(a){var b=a.parent;null!==b&&Wc(b);a.context._currentValue=a.value}
function Xc(a,b){a.context._currentValue=a.parentValue;a=a.parent;if(null===a)throw Error(k(402));a.depth===b.depth?Uc(a,b):Xc(a,b)}function Yc(a,b){var c=b.parent;if(null===c)throw Error(k(402));a.depth===c.depth?Uc(a,c):Yc(a,c);b.context._currentValue=b.value}function Zc(a){var b=Q;b!==a&&(null===b?Wc(a):null===a?Vc(b):b.depth===a.depth?Uc(b,a):b.depth>a.depth?Xc(b,a):Yc(b,a),Q=a)}
var $c={isMounted:function(){return!1},enqueueSetState:function(a,b){a=a._reactInternals;null!==a.queue&&a.queue.push(b)},enqueueReplaceState:function(a,b){a=a._reactInternals;a.replace=!0;a.queue=[b]},enqueueForceUpdate:function(){}};
function ad(a,b,c,d){var e=void 0!==a.state?a.state:null;a.updater=$c;a.props=c;a.state=e;var f={queue:[],replace:!1};a._reactInternals=f;var g=b.contextType;a.context="object"===typeof g&&null!==g?g._currentValue:d;g=b.getDerivedStateFromProps;"function"===typeof g&&(g=g(c,e),e=null===g||void 0===g?e:F({},e,g),a.state=e);if("function"!==typeof b.getDerivedStateFromProps&&"function"!==typeof a.getSnapshotBeforeUpdate&&("function"===typeof a.UNSAFE_componentWillMount||"function"===typeof a.componentWillMount))if(b=
a.state,"function"===typeof a.componentWillMount&&a.componentWillMount(),"function"===typeof a.UNSAFE_componentWillMount&&a.UNSAFE_componentWillMount(),b!==a.state&&$c.enqueueReplaceState(a,a.state,null),null!==f.queue&&0<f.queue.length)if(b=f.queue,g=f.replace,f.queue=null,f.replace=!1,g&&1===b.length)a.state=b[0];else{f=g?b[0]:a.state;e=!0;for(g=g?1:0;g<b.length;g++){var h=b[g];h="function"===typeof h?h.call(a,f,c,d):h;null!=h&&(e?(e=!1,f=F({},f,h)):F(f,h))}a.state=f}else f.queue=null}
var bd={id:1,overflow:""};function cd(a,b,c){var d=a.id;a=a.overflow;var e=32-dd(d)-1;d&=~(1<<e);c+=1;var f=32-dd(b)+e;if(30<f){var g=e-e%5;f=(d&(1<<g)-1).toString(32);d>>=g;e-=g;return{id:1<<32-dd(b)+e|c<<e|d,overflow:f+a}}return{id:1<<f|c<<e|d,overflow:a}}var dd=Math.clz32?Math.clz32:ed,fd=Math.log,gd=Math.LN2;function ed(a){a>>>=0;return 0===a?32:31-(fd(a)/gd|0)|0}
function hd(a){switch(a.status){case "fulfilled":case "rejected":break;default:"string"!==typeof a.status&&(a.status="pending",a.then(function(b){"pending"===a.status&&(a.status="fulfilled",a.value=b)},function(b){"pending"===a.status&&(a.status="rejected",a.reason=b)}))}}function id(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var jd="function"===typeof Object.is?Object.is:id,R=null,kd=null,ld=null,S=null,md=!1,nd=!1,T=0,od=0,U=null,W=null,pd=0;
function X(){if(null===R)throw Error(k(321));return R}function qd(){if(0<pd)throw Error(k(312));return{memoizedState:null,queue:null,next:null}}function rd(){null===S?null===ld?(md=!1,ld=S=qd()):(md=!0,S=ld):null===S.next?(md=!1,S=S.next=qd()):(md=!0,S=S.next);return S}function sd(a,b,c,d){for(;nd;)nd=!1,od=T=0,pd+=1,S=null,c=a(b,d);td();return c}function ud(){var a=U;U=null;return a}function td(){kd=R=null;nd=!1;ld=null;pd=0;S=W=null}function vd(a,b){return"function"===typeof b?b(a):b}
function wd(a,b,c){R=X();S=rd();if(md){var d=S.queue;b=d.dispatch;if(null!==W&&(c=W.get(d),void 0!==c)){W.delete(d);d=S.memoizedState;do d=a(d,c.action),c=c.next;while(null!==c);S.memoizedState=d;return[d,b]}return[S.memoizedState,b]}a=a===vd?"function"===typeof b?b():b:void 0!==c?c(b):b;S.memoizedState=a;a=S.queue={last:null,dispatch:null};a=a.dispatch=xd.bind(null,R,a);return[S.memoizedState,a]}
function yd(a,b){R=X();S=rd();b=void 0===b?null:b;if(null!==S){var c=S.memoizedState;if(null!==c&&null!==b){var d=c[1];a:if(null===d)d=!1;else{for(var e=0;e<d.length&&e<b.length;e++)if(!jd(b[e],d[e])){d=!1;break a}d=!0}if(d)return c[0]}}a=a();S.memoizedState=[a,b];return a}function xd(a,b,c){if(25<=pd)throw Error(k(301));if(a===R)if(nd=!0,a={action:c,next:null},null===W&&(W=new Map),c=W.get(b),void 0===c)W.set(b,a);else{for(b=c;null!==b.next;)b=b.next;b.next=a}}
function zd(){throw Error(k(440));}function Ad(){throw Error(k(394));}function Bd(){throw Error(k(393));}function Cd(){}
var Ed={readContext:function(a){return a._currentValue},useContext:function(a){X();return a._currentValue},useMemo:yd,useReducer:wd,useRef:function(a){R=X();S=rd();var b=S.memoizedState;return null===b?(a={current:a},S.memoizedState=a):b},useState:function(a){return wd(vd,a)},useInsertionEffect:Cd,useLayoutEffect:function(){},useCallback:function(a,b){return yd(function(){return a},b)},useImperativeHandle:Cd,useEffect:Cd,useDebugValue:Cd,useDeferredValue:function(a){X();return a},useTransition:function(){X();
return[!1,Ad]},useId:function(){var a=kd.treeContext;var b=a.overflow;a=a.id;a=(a&~(1<<32-dd(a)-1)).toString(32)+b;var c=Dd;if(null===c)throw Error(k(404));b=T++;a=":"+c.idPrefix+"R"+a;0<b&&(a+="H"+b.toString(32));return a+":"},useMutableSource:function(a,b){X();return b(a._source)},useSyncExternalStore:function(a,b,c){if(void 0===c)throw Error(k(407));return c()},useCacheRefresh:function(){return Bd},useEvent:function(){return zd},useMemoCache:function(a){return Array(a)},use:function(a){if(null!==
a&&"object"===typeof a)if("function"===typeof a.then){var b=od;od+=1;switch(a.status){case "fulfilled":return a.value;case "rejected":throw a.reason;default:a:{if(null!==U){var c=U[b];if(void 0!==c)break a}c=null}if(null!==c)switch(c.status){case "fulfilled":return c.value;case "rejected":throw c.reason;default:throw c;}else throw null===U&&(U=[]),U[b]=a,a;}}else if(a.$$typeof===Cc||a.$$typeof===Dc)return a._currentValue;throw Error(k(438,String(a)));}},Dd=null,Fd={getCacheSignal:function(){throw Error(k(248));
},getCacheForType:function(){throw Error(k(248));}},Gd=Rc.ReactCurrentDispatcher,Hd=Rc.ReactCurrentCache;function Id(a){console.error(a);return null}function Jd(){}
function Kd(a,b,c,d,e,f,g,h,m){var n=[],t=new Set,r={preloadsMap:new Map,stylesMap:new Map,explicitPreloads:new Set,implicitPreloads:new Set,precedences:new Map,boundaryResources:null};b={destination:null,responseState:b,progressiveChunkSize:void 0===d?12800:d,status:0,fatalError:null,nextSegmentId:0,allPendingTasks:0,pendingRootTasks:0,resources:r,completedRootSegment:null,abortableTasks:t,pingedTasks:n,clientRenderedBoundaries:[],completedBoundaries:[],partialBoundaries:[],preamble:[],postamble:[],
onError:void 0===e?Id:e,onAllReady:void 0===f?Jd:f,onShellReady:void 0===g?Jd:g,onShellError:void 0===h?Jd:h,onFatalError:void 0===m?Jd:m};c=Ld(b,0,null,c,!1,!1);c.parentFlushed=!0;a=Md(b,null,a,null,c,t,Sc,null,bd);n.push(a);return b}
function Md(a,b,c,d,e,f,g,h,m){a.allPendingTasks++;null===d?a.pendingRootTasks++:d.pendingTasks++;var n={node:c,ping:function(){var b=a.pingedTasks;b.push(n);1===b.length&&Nd(a)},blockedBoundary:d,blockedSegment:e,abortSet:f,legacyContext:g,context:h,treeContext:m,thenableState:b};f.add(n);return n}function Ld(a,b,c,d,e,f){return{status:0,id:-1,index:b,parentFlushed:!1,chunks:[],children:[],formatContext:d,boundary:c,lastPushedText:e,textEmbedded:f}}
function Y(a,b){a=a.onError(b);if(null!=a&&"string"!==typeof a)throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "'+typeof a+'" instead');return a}function Od(a,b){var c=a.onShellError;c(b);c=a.onFatalError;c(b);null!==a.destination?(a.status=2,fa(a.destination,b)):(a.status=1,a.fatalError=b)}
function Pd(a,b,c,d){var e=c.render(),f=d.childContextTypes;if(null!==f&&void 0!==f){var g=b.legacyContext;if("function"!==typeof c.getChildContext)d=g;else{c=c.getChildContext();for(var h in c)if(!(h in f))throw Error(k(108,Qc(d)||"Unknown",h));d=F({},g,c)}b.legacyContext=d;Z(a,b,null,e);b.legacyContext=g}else Z(a,b,null,e)}function Qd(a,b){if(a&&a.defaultProps){b=F({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);return b}return b}
function Rd(a,b,c,d,e,f){if("function"===typeof d)if(d.prototype&&d.prototype.isReactComponent)c=Tc(d,b.legacyContext),f=d.contextType,f=new d(e,"object"===typeof f&&null!==f?f._currentValue:c),ad(f,d,e,c),Pd(a,b,f,d);else{f=Tc(d,b.legacyContext);R={};kd=b;od=T=0;U=c;c=d(e,f);c=sd(d,e,c,f);var g=0!==T;if("object"===typeof c&&null!==c&&"function"===typeof c.render&&void 0===c.$$typeof)ad(c,d,e,f),Pd(a,b,c,d);else if(g){e=b.treeContext;b.treeContext=cd(e,1,0);try{Z(a,b,null,c)}finally{b.treeContext=
e}}else Z(a,b,null,c)}else if("string"===typeof d){c=b.blockedSegment;f=ib(c.chunks,a.preamble,d,e,a.responseState,c.formatContext,c.lastPushedText);c.lastPushedText=!1;g=c.formatContext;c.formatContext=Ra(g,d,e);Sd(a,b,f);c.formatContext=g;a:{b=c.chunks;a=a.postamble;switch(d){case "area":case "base":case "br":case "col":case "embed":case "hr":case "img":case "input":case "keygen":case "link":case "meta":case "param":case "source":case "track":case "wbr":break a;case "body":a.unshift(jb,v(d),kb);
break a;case "html":a.push(jb,v(d),kb);break a}b.push(jb,v(d),kb)}c.lastPushedText=!1}else{switch(d){case Mc:case Kc:case zc:case Ac:case yc:Z(a,b,null,e.children);return;case Lc:"hidden"!==e.mode&&Z(a,b,null,e.children);return;case Gc:Z(a,b,null,e.children);return;case Jc:throw Error(k(343));case Fc:a:{d=b.blockedBoundary;c=b.blockedSegment;f=e.fallback;e=e.children;g=new Set;var h={id:null,rootSegmentID:-1,parentFlushed:!1,pendingTasks:0,forceClientRender:!1,completedSegments:[],byteSize:0,fallbackAbortableTasks:g,
errorDigest:null,resources:new Set},m=Ld(a,c.chunks.length,h,c.formatContext,!1,!1);c.children.push(m);c.lastPushedText=!1;var n=Ld(a,0,null,c.formatContext,!1,!1);n.parentFlushed=!0;b.blockedBoundary=h;b.blockedSegment=n;a.resources.boundaryResources=h.resources;try{if(Sd(a,b,e),n.lastPushedText&&n.textEmbedded&&n.chunks.push(Sa),n.status=1,0===h.pendingTasks&&(null!==a.completedRootSegment||0<a.pendingRootTasks)&&Fa(a.resources,h.resources),Td(h,n),0===h.pendingTasks)break a}catch(t){n.status=4,
h.forceClientRender=!0,h.errorDigest=Y(a,t)}finally{a.resources.boundaryResources=d?d.resources:null,b.blockedBoundary=d,b.blockedSegment=c}b=Md(a,null,f,d,m,g,b.legacyContext,b.context,b.treeContext);a.pingedTasks.push(b)}return}if("object"===typeof d&&null!==d)switch(d.$$typeof){case Ec:d=d.render;R={};kd=b;od=T=0;U=c;c=d(e,f);e=sd(d,e,c,f);if(0!==T){d=b.treeContext;b.treeContext=cd(d,1,0);try{Z(a,b,null,e)}finally{b.treeContext=d}}else Z(a,b,null,e);return;case Hc:d=d.type;e=Qd(d,e);Rd(a,b,c,d,
e,f);return;case Bc:c=e.children;d=d._context;e=e.value;f=d._currentValue;d._currentValue=e;g=Q;Q=e={parent:g,depth:null===g?0:g.depth+1,context:d,parentValue:f,value:e};b.context=e;Z(a,b,null,c);a=Q;if(null===a)throw Error(k(403));e=a.parentValue;a.context._currentValue=e===Oc?a.context._defaultValue:e;a=Q=a.parent;b.context=a;return;case Cc:e=e.children;e=e(d._currentValue);Z(a,b,null,e);return;case Ic:f=d._init;d=f(d._payload);e=Qd(d,e);Rd(a,b,c,d,e,void 0);return}throw Error(k(130,null==d?d:typeof d,
""));}}
function Z(a,b,c,d){b.node=d;if("object"===typeof d&&null!==d){switch(d.$$typeof){case wc:Rd(a,b,c,d.type,d.props,d.ref);return;case xc:throw Error(k(257));case Ic:c=d._init;d=c(d._payload);Z(a,b,null,d);return}if(ta(d)){Ud(a,b,d);return}null===d||"object"!==typeof d?c=null:(c=Pc&&d[Pc]||d["@@iterator"],c="function"===typeof c?c:null);if(c&&(c=c.call(d))){d=c.next();if(!d.done){var e=[];do e.push(d.value),d=c.next();while(!d.done);Ud(a,b,e)}return}a=Object.prototype.toString.call(d);throw Error(k(31,"[object Object]"===
a?"object with keys {"+Object.keys(d).join(", ")+"}":a));}"string"===typeof d?(c=b.blockedSegment,c.lastPushedText=Ta(b.blockedSegment.chunks,d,a.responseState,c.lastPushedText)):"number"===typeof d&&(c=b.blockedSegment,c.lastPushedText=Ta(b.blockedSegment.chunks,""+d,a.responseState,c.lastPushedText))}function Ud(a,b,c){for(var d=c.length,e=0;e<d;e++){var f=b.treeContext;b.treeContext=cd(f,d,e);try{Sd(a,b,c[e])}finally{b.treeContext=f}}}
function Sd(a,b,c){var d=b.blockedSegment.formatContext,e=b.legacyContext,f=b.context;try{return Z(a,b,null,c)}catch(n){if(td(),"object"===typeof n&&null!==n&&"function"===typeof n.then){var g=ud();c=n;var h=b.blockedSegment,m=Ld(a,h.chunks.length,null,h.formatContext,h.lastPushedText,!0);h.children.push(m);h.lastPushedText=!1;a=Md(a,g,b.node,b.blockedBoundary,m,b.abortSet,b.legacyContext,b.context,b.treeContext);hd(c);a=a.ping;c.then(a,a);b.blockedSegment.formatContext=d;b.legacyContext=e;b.context=
f;Zc(f)}else throw b.blockedSegment.formatContext=d,b.legacyContext=e,b.context=f,Zc(f),n;}}function Vd(a){var b=a.blockedBoundary;a=a.blockedSegment;a.status=3;Wd(this,b,a)}
function Xd(a,b,c){var d=a.blockedBoundary;a.blockedSegment.status=3;null===d?(b.allPendingTasks--,1!==b.status&&2!==b.status&&(Y(b,c),Od(b,c))):(d.pendingTasks--,d.forceClientRender||(d.forceClientRender=!0,d.errorDigest=b.onError(c),d.parentFlushed&&b.clientRenderedBoundaries.push(d)),d.fallbackAbortableTasks.forEach(function(a){return Xd(a,b,c)}),d.fallbackAbortableTasks.clear(),b.allPendingTasks--,0===b.allPendingTasks&&(a=b.onAllReady,a()))}
function Td(a,b){if(0===b.chunks.length&&1===b.children.length&&null===b.children[0].boundary){var c=b.children[0];c.id=b.id;c.parentFlushed=!0;1===c.status&&Td(a,c)}else a.completedSegments.push(b)}
function Wd(a,b,c){if(null===b){if(c.parentFlushed){if(null!==a.completedRootSegment)throw Error(k(389));a.completedRootSegment=c}a.pendingRootTasks--;0===a.pendingRootTasks&&(a.onShellError=Jd,b=a.onShellReady,b())}else b.pendingTasks--,b.forceClientRender||(0===b.pendingTasks?(c.parentFlushed&&1===c.status&&Td(b,c),(null!==a.completedRootSegment||0<a.pendingRootTasks)&&Fa(a.resources,b.resources),b.parentFlushed&&a.completedBoundaries.push(b),b.fallbackAbortableTasks.forEach(Vd,a),b.fallbackAbortableTasks.clear()):
c.parentFlushed&&1===c.status&&(Td(b,c),1===b.completedSegments.length&&b.parentFlushed&&a.partialBoundaries.push(b)));a.allPendingTasks--;0===a.allPendingTasks&&(a=a.onAllReady,a())}
function Nd(a){if(2!==a.status){var b=Q,c=Gd.current;Gd.current=Ed;var d=Hd.current;Hd.current=Fd;var e=a.resources;va.push(G);G=e;e=Ga.current;Ga.current=za;var f=Dd;Dd=a.responseState;try{var g=a.pingedTasks,h;for(h=0;h<g.length;h++){var m=g[h];var n=a,t=m.blockedBoundary;n.resources.boundaryResources=t?t.resources:null;var r=m.blockedSegment;if(0===r.status){Zc(m.context);try{var w=m.thenableState;m.thenableState=null;Z(n,m,w,m.node);r.lastPushedText&&r.textEmbedded&&r.chunks.push(Sa);m.abortSet.delete(m);
r.status=1;Wd(n,m.blockedBoundary,r)}catch(N){if(td(),"object"===typeof N&&null!==N&&"function"===typeof N.then){var z=m.ping;N.then(z,z);hd(N);m.thenableState=ud()}else{m.abortSet.delete(m);r.status=4;var C=n,D=m.blockedBoundary,V=N,xa=Y(C,V);null===D?Od(C,V):(D.pendingTasks--,D.forceClientRender||(D.forceClientRender=!0,D.errorDigest=xa,D.parentFlushed&&C.clientRenderedBoundaries.push(D)));C.allPendingTasks--;if(0===C.allPendingTasks){var aa=C.onAllReady;aa()}}}finally{n.resources.boundaryResources=
null}}}g.splice(0,h);null!==a.destination&&Yd(a,a.destination)}catch(N){Y(a,N),Od(a,N)}finally{Dd=f,Gd.current=c,Hd.current=d,G=va.pop(),Ga.current=e,c===Ed&&Zc(b)}}}
function Zd(a,b,c){c.parentFlushed=!0;switch(c.status){case 0:var d=c.id=a.nextSegmentId++;c.lastPushedText=!1;c.textEmbedded=!1;a=a.responseState;q(b,lb);q(b,a.placeholderPrefix);a=v(d.toString(16));q(b,a);return u(b,mb);case 1:c.status=2;var e=!0;d=c.chunks;var f=0;c=c.children;for(var g=0;g<c.length;g++){for(e=c[g];f<e.index;f++)q(b,d[f]);e=$d(a,b,e)}for(;f<d.length-1;f++)q(b,d[f]);f<d.length&&(e=u(b,d[f]));return e;default:throw Error(k(390));}}
function $d(a,b,c){var d=c.boundary;if(null===d)return Zd(a,b,c);d.parentFlushed=!0;if(d.forceClientRender)d=d.errorDigest,u(b,qb),q(b,sb),d&&(q(b,ub),q(b,v(E(d))),q(b,tb)),u(b,vb),Zd(a,b,c);else if(0<d.pendingTasks){d.rootSegmentID=a.nextSegmentId++;0<d.completedSegments.length&&a.partialBoundaries.push(d);var e=a.responseState;var f=e.nextSuspenseID++;e=x(e.boundaryPrefix+f.toString(16));d=d.id=e;wb(b,a.responseState,d);Zd(a,b,c)}else if(d.byteSize>a.progressiveChunkSize)d.rootSegmentID=a.nextSegmentId++,
a.completedBoundaries.push(d),wb(b,a.responseState,d.id),Zd(a,b,c);else{c=a.resources;e=d.resources;c.boundaryResources&&(ua(c.boundaryResources,e),e.clear());u(b,nb);c=d.completedSegments;if(1!==c.length)throw Error(k(391));$d(a,b,c[0])}return u(b,rb)}function ae(a,b,c){Sb(b,a.responseState,c.formatContext,c.id);$d(a,b,c);return Tb(b,c.formatContext)}
function be(a,b,c){a.resources.boundaryResources=c.resources;for(var d=c.completedSegments,e=0;e<d.length;e++)ce(a,b,c,d[e]);d.length=0;a=a.responseState;d=c.id;e=c.rootSegmentID;c=c.resources;var f;a:{for(f=c.values();;){var g=f.next().value;if(!g)break;if(!g.inShell){f=!0;break a}}f=!1}q(b,a.startInlineScript);f?a.sentCompleteBoundaryFunction?a.sentStyleInsertionFunction?q(b,bc):(a.sentStyleInsertionFunction=!0,q(b,ac)):(a.sentCompleteBoundaryFunction=!0,a.sentStyleInsertionFunction=!0,q(b,$b)):
a.sentCompleteBoundaryFunction?q(b,Zb):(a.sentCompleteBoundaryFunction=!0,q(b,Yb));if(null===d)throw Error(k(395));e=v(e.toString(16));q(b,d);q(b,cc);q(b,a.segmentPrefix);q(b,e);f?(q(b,dc),vc(b,c)):q(b,ec);return u(b,fc)}
function ce(a,b,c,d){if(2===d.status)return!0;var e=d.id;if(-1===e){if(-1===(d.id=c.rootSegmentID))throw Error(k(392));return ae(a,b,d)}ae(a,b,d);a=a.responseState;q(b,a.startInlineScript);a.sentCompleteSegmentFunction?q(b,Vb):(a.sentCompleteSegmentFunction=!0,q(b,Ub));q(b,a.segmentPrefix);e=v(e.toString(16));q(b,e);q(b,Wb);q(b,a.placeholderPrefix);q(b,e);return u(b,Xb)}
function Yd(a,b){l=new Uint8Array(512);p=0;try{var c,d=a.completedRootSegment;if(null!==d)if(0===a.pendingRootTasks){var e=a.preamble;for(c=0;c<e.length;c++)q(b,e[c]);pc(b,a.resources,a.responseState);$d(a,b,d);a.completedRootSegment=null;var f=a.responseState.bootstrapChunks;for(d=0;d<f.length-1;d++)q(b,f[d]);d<f.length&&u(b,f[d])}else return;else qc(b,a.resources,a.responseState);var g=a.clientRenderedBoundaries;for(c=0;c<g.length;c++){var h=g[c];f=b;var m=a.responseState,n=h.id,t=h.errorDigest,
r=h.errorMessage,w=h.errorComponentStack;q(f,m.startInlineScript);m.sentClientRenderFunction?q(f,hc):(m.sentClientRenderFunction=!0,q(f,gc));if(null===n)throw Error(k(395));q(f,n);q(f,ic);if(t||r||w)q(f,kc),q(f,v(mc(t||"")));if(r||w)q(f,kc),q(f,v(mc(r||"")));w&&(q(f,kc),q(f,v(mc(w))));if(!u(f,jc)){a.destination=null;c++;g.splice(0,c);return}}g.splice(0,c);var z=a.completedBoundaries;for(c=0;c<z.length;c++)if(!be(a,b,z[c])){a.destination=null;c++;z.splice(0,c);return}z.splice(0,c);da(b);l=new Uint8Array(512);
p=0;var C=a.partialBoundaries;for(c=0;c<C.length;c++){var D=C[c];a:{g=a;h=b;g.resources.boundaryResources=D.resources;var V=D.completedSegments;for(m=0;m<V.length;m++)if(!ce(g,h,D,V[m])){m++;V.splice(0,m);var xa=!1;break a}V.splice(0,m);xa=!0}if(!xa){a.destination=null;c++;C.splice(0,c);return}}C.splice(0,c);var aa=a.completedBoundaries;for(c=0;c<aa.length;c++)if(!be(a,b,aa[c])){a.destination=null;c++;aa.splice(0,c);return}aa.splice(0,c)}finally{if(0===a.allPendingTasks&&0===a.pingedTasks.length&&
0===a.clientRenderedBoundaries.length&&0===a.completedBoundaries.length){a=a.postamble;for(c=0;c<a.length;c++)q(b,a[c]);da(b);b.close()}else da(b)}}function de(a,b){try{var c=a.abortableTasks;if(0<c.size){var d=void 0===b?Error(k(432)):b;c.forEach(function(b){return Xd(b,a,d)});c.clear()}null!==a.destination&&Yd(a,a.destination)}catch(e){Y(a,e),Od(a,e)}}
exports.prerender=function(a,b){return new Promise(function(c,d){var e=Kd(a,Pa(b?b.identifierPrefix:void 0,void 0,b?b.bootstrapScriptContent:void 0,b?b.bootstrapScripts:void 0,b?b.bootstrapModules:void 0),Qa(b?b.namespaceURI:void 0),b?b.progressiveChunkSize:void 0,b?b.onError:void 0,function(){var a={prelude:new ReadableStream({type:"bytes",pull:function(a){if(1===e.status)e.status=2,fa(a,e.fatalError);else if(2!==e.status&&null===e.destination){e.destination=a;try{Yd(e,a)}catch(n){Y(e,n),Od(e,n)}}}},
{highWaterMark:0})};c(a)},void 0,void 0,d);if(b&&b.signal){var f=b.signal;if(f.aborted)de(e,f.reason);else{var g=function(){de(e,f.reason);f.removeEventListener("abort",g)};f.addEventListener("abort",g)}}Nd(e)})};exports.version="18.3.0-experimental-a8c16a004-20221012";


/***/ }),

/***/ 589:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



if (process.env.NODE_ENV === 'production') {
  module.exports = __nccwpck_require__(324);
} else {
  module.exports = __nccwpck_require__(993);
}


/***/ }),

/***/ 533:
/***/ ((module) => {

module.exports = require("next/dist/compiled/react");

/***/ }),

/***/ 174:
/***/ ((module) => {

module.exports = require("next/dist/compiled/react-dom");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(589);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;