'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fdescribe = exports.xdescribe = exports.xit = exports.fit = exports.afterEach = exports.after = exports.beforeEach = exports.before = exports.it = exports.describe = undefined;
exports.specs = specs;

var _storybookAddons = require('@kadira/storybook-addons');

var _storybookAddons2 = _interopRequireDefault(_storybookAddons);

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var currentStory = "";
var results = {};
var beforeEachFunc = {};
var afterFunc = {};
var afterEachFunc = {};
var promises = [];

function specs(specs) {
  var storyName = specs();

  // TODO: we've added basic support for async tests, but this 
  // requires the test to implement a promise mechanism.
  // A better way to do this is to figure out how to support the 
  // 'done' callback that 'it' conventionally accepts.
  Promise.all(promises).then(function () {
    var channel = _storybookAddons2.default.getChannel();
    channel.emit(_.EVENT_ID, { results: results[storyName] });
  }).catch(function () {
    var channel = _storybookAddons2.default.getChannel();
    channel.emit(_.EVENT_ID, { results: results[storyName] });
  });
}

var describe = exports.describe = function describe(storyName, func) {
  currentStory = storyName;
  results[currentStory] = {
    goodResults: [],
    wrongResults: []
  };

  func();

  if (afterFunc[currentStory]) afterFunc[currentStory]();

  return storyName;
};

var it = exports.it = function it(desc, func) {
  if (beforeEachFunc[currentStory]) beforeEachFunc[currentStory]();
  try {
    var result = func();

    if (result && result.then) {
      var localCurrentStory = currentStory;
      promises.push(result);

      result.then(function () {
        results[localCurrentStory].goodResults.push(desc);
      }).catch(function (e) {
        console.error(localCurrentStory + ' - ' + desc + ' : ' + e);
        results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
      });
    } else {
      results[currentStory].goodResults.push(desc);
    }
  } catch (e) {
    console.error(currentStory + ' - ' + desc + ' : ' + e);
    results[currentStory].wrongResults.push({ spec: desc, message: e.message });
  }
  if (afterEachFunc[currentStory]) afterEachFunc[currentStory]();
};

var before = exports.before = function before(func) {
  func();
};

var beforeEach = exports.beforeEach = function beforeEach(func) {
  beforeEachFunc[currentStory] = func;
};

var after = exports.after = function after(func) {
  afterFunc[currentStory] = func;
};

var afterEach = exports.afterEach = function afterEach(func) {
  afterEachFunc[currentStory] = func;
};

var fit = exports.fit = function fit(desc, func) {
  it(desc, func);
};

var xit = exports.xit = function xit(desc, func) {};

var xdescribe = exports.xdescribe = function xdescribe(storyName, func) {
  currentStory = storyName;
  results[currentStory] = {
    goodResults: [],
    wrongResults: []
  };
  return storyName;
};

describe.skip = function (storyName, func) {
  currentStory = storyName;
  results[currentStory] = {
    goodResults: [],
    wrongResults: []
  };
  return storyName;
};

it.only = function (desc, func) {
  it(desc, func);
};

it.skip = function (desc, func) {};

describe.only = function (storyName, func) {
  return describe(storyName, func);
};

var fdescribe = exports.fdescribe = function fdescribe(storyName, func) {
  return describe(storyName, func);
};