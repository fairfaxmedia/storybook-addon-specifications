import addons from '@kadira/storybook-addons';
import { EVENT_ID } from './';

let currentStory = "";
const results = {};
const beforeEachFunc = {};
const afterFunc = {};
const afterEachFunc = {};
const promises = [];

const DEFAULT_TIMEOUT = 2000;
let _timeout = DEFAULT_TIMEOUT;

export function specs(specs) {
  let storyName = specs();

  Promise.all(promises).then(() => {
    const channel = addons.getChannel();
    channel.emit(EVENT_ID, {results : results[storyName]});
  })
  .catch(() => {
    const channel = addons.getChannel();
    channel.emit(EVENT_ID, {results : results[storyName]});
  });
}

export const describe = (storyName, func) => {
  currentStory = storyName;
  results[currentStory] = {
    goodResults: [],
    wrongResults: []
  };

  func();

  if(afterFunc[currentStory]) afterFunc[currentStory]();

  return storyName;
};

export const it = function (desc, func) {
  if (beforeEachFunc[currentStory]) {
    beforeEachFunc[currentStory]();
  }

  if (func.length) {
    // We've been called with a callback function, so are presumably async
    const localCurrentStory = currentStory;
    const promise = new Promise((resolve, reject) => {
      try {
        const timer = setTimeout(() => {
            const err = new Error('Timeout of ' + _timeout +
            'ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.');
            //console.error(`${currentStory} - ${desc} : ${err}`);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: err.message });
            reject();
        }, _timeout);

        const result = func((e) => {
          if (e instanceof Error || toString.call(e) === '[object Error]') {
            console.error(`${localCurrentStory} - ${desc} : ${e}`);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
            clearTimeout(timer);
            reject();
          }

          if (e) {
            if (Object.prototype.toString.call(e) === '[object Object]') {
              console.error(`${localCurrentStory} - ${desc} : ${e}`);
              results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
              clearTimeout(timer);
              reject();
            }

            const err = new Error('done() invoked with non-Error: ' + e);
            console.error(`${localCurrentStory} - ${desc} : ${err}`);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: err.message ? err.message : err });
            clearTimeout(timer);
            reject();
          }

          if (result && utils.isPromise(result)) {
            const err = new Error('Resolution method is overspecified. Specify a callback *or* return a Promise; not both.');
            console.error(`${localCurrentStory} - ${desc} : ${err}`);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: err.message ? err.message : err });
            clearTimeout(timer);
            reject();
          }

          results[localCurrentStory].goodResults.push(desc);
          clearTimeout(timer);
          resolve();
        });
      } catch(e) {
        console.error(`${localCurrentStory} - ${desc} : ${e}`);
        results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message });
        clearTimeout(timer);
        reject();
      }
    })
    promises.push(promise);
  } else {
    // We're either sync, or async using a promise    
    try {
      const result = func();

      if (result && result.then) {
        const localCurrentStory = currentStory;
        promises.push(result);

        result
          .then(() => {
            results[localCurrentStory].goodResults.push(desc);
          })
          .catch(function(e) {
            console.error(`${localCurrentStory} - ${desc} : ${e}`);
            results[localCurrentStory].wrongResults.push({ spec: desc, message: e.message ? e.message : e });
          });
      } else {
        results[currentStory].goodResults.push(desc);
      }
    } catch (e) {
      console.error(`${currentStory} - ${desc} : ${e}`);
      results[currentStory].wrongResults.push({ spec: desc, message: e.message });
    }
  }

  if (afterEachFunc[currentStory]) {
    afterEachFunc[currentStory]();
  }

  return it;
};

export const before = function(func) {
  func()
};

export const beforeEach = function(func) {
  beforeEachFunc[currentStory] =  func;
};

export const after = function(func) {
  afterFunc[currentStory] =  func;
};

export const afterEach = function(func) {
  afterEachFunc[currentStory] =  func;
};

export const fit = function (desc, func) {
  it(desc, func)
};

export const xit = function (desc, func) {

};

export const xdescribe = function (storyName, func){
  currentStory = storyName;
  results[currentStory] = {
    goodResults: [],
    wrongResults: []
  };
  return storyName;
};

describe.skip = function (storyName, func){
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

it.skip = function (desc, func) {

};

describe.only = function (storyName, func) {
  return describe(storyName, func)
};

export const fdescribe = function (storyName, func) {
  return describe(storyName, func)
};