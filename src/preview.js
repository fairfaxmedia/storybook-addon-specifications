import addons from '@kadira/storybook-addons';
import { EVENT_ID } from './';

let currentStory = "";
const results = {};
const beforeEachFunc = {};
const afterFunc = {};
const afterEachFunc = {};
const promises = [];

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
  if(beforeEachFunc[currentStory]) beforeEachFunc[currentStory]();
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
  if(afterEachFunc[currentStory]) afterEachFunc[currentStory]();
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