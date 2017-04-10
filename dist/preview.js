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

var DEFAULT_TIMEOUT = 2000;
var _timeout = DEFAULT_TIMEOUT;

function specs(specs) {
  var storyName = specs();

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
  if (beforeEachFunc[currentStory]) {
    beforeEachFunc[currentStory]();
  }

  if (func.length) {
    // We've been called with a callback function, so are presumably async
    var localCurrentStory = currentStory;
    var promise = new Promise(function (resolve, reject) {
      try {
        var _timer = setTimeout(function () {
          var err = new Error('Timeout of ' + _timeout + 'ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.');
          //console.error(`${currentStory} - ${desc} : ${err}`);
          results[localCurrentStory].wrongResults.push({ spec: desc, message: err.message });
          reject();
        }, _timeout);

        var result = func(function (e) {
          if (e instanceof Error || toString.call(e) === '[object Error]') {
            console.error(localCurrentStory + ' - ' + desc + ' : ' + e);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
            clearTimeout(_timer);
            reject();
          }

          if (e) {
            if (Object.prototype.toString.call(e) === '[object Object]') {
              console.error(localCurrentStory + ' - ' + desc + ' : ' + e);
              results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
              clearTimeout(_timer);
              reject();
            }

            var err = new Error('done() invoked with non-Error: ' + e);
            console.error(localCurrentStory + ' - ' + desc + ' : ' + err);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: err.message ? err.message : err });
            clearTimeout(_timer);
            reject();
          }

          if (result && utils.isPromise(result)) {
            var _err = new Error('Resolution method is overspecified. Specify a callback *or* return a Promise; not both.');
            console.error(localCurrentStory + ' - ' + desc + ' : ' + _err);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: _err.message ? _err.message : _err });
            clearTimeout(_timer);
            reject();
          }

          results[localCurrentStory].goodResults.push(desc);
          clearTimeout(_timer);
          resolve();
        });
      } catch (e) {
        console.error(localCurrentStory + ' - ' + desc + ' : ' + e);
        results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message });
        clearTimeout(timer);
        reject();
      }
    });
    promises.push(promise);
  } else {
    // We're either sync, or async using a promise    
    try {
      var result = func();

      if (result && result.then) {
        var _localCurrentStory = currentStory;
        promises.push(result);

        result.then(function () {
          results[_localCurrentStory].goodResults.push(desc);
        }).catch(function (e) {
          console.error(_localCurrentStory + ' - ' + desc + ' : ' + e);
          results[_localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
        });
      } else {
        results[currentStory].goodResults.push(desc);
      }
    } catch (e) {
      console.error(currentStory + ' - ' + desc + ' : ' + e);
      results[currentStory].wrongResults.push({ spec: desc, message: e.message });
    }
  }

  if (afterEachFunc[currentStory]) {
    afterEachFunc[currentStory]();
  }

  return it;
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