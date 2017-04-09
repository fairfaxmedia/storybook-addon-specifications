import React from "react";
import {mount, shallow} from "enzyme";
import chai from "chai";
import chaiEnzyme from "chai-enzyme";
import expect from "expect";
import sinon from "sinon";

const stories = storiesOf('Button - CI MOCHA Sample', module);

chai.use(chaiEnzyme());

const Components = {
  Hello: function(props) {
    return <button onClick={action('Hello World')} className={'button'}>
      {props.text}
    </button>;
  }
};

stories.add('The Hello button', function () {
  let output;
  specs(() => describe('The Hello button', function () {
    beforeEach(function() {
      console.log('BEFORE EACH');
      output = mount(<Components.Hello text={'Hello World'} />);
    });

    before(function() {
      console.log('BEFORE');
    });

    afterEach(function() {
      console.log('AFTER EACH');
      output.unmount();
    });

    after(function() {
      console.log('AFTER ');
    });

    it('Should have the Hello World text during a synchronous test', function () {
      expect(output.text()).toEqual('Hello World');
    });

    it('Should have the Hello World text during an asynchronous promise test', function () {
      return new Promise(function (resolve) {
        setTimeout(function() {
          expect(output.text()).toContain('Hello World');
          resolve();
        }, 200)
      })
    });

    it('Should have the Hello World text during an asynchronous done test', function (done) {
      setTimeout(function() {
        expect(output.text()).toContain('Hello World');
        done();
      }, 200)
    });
  }));

  return output;
});

stories.add('Hello Earth', function () {
  let output;
  specs(() => describe('Hello Earth', function () {
    it('Should have the Hello Earth label during a synchronous test', function () {
      output = mount(<Components.Hello text={'Hello Earth'} />);
      expect(output.text()).toContain('Hello Earth');
    });
  }));

  return output;
});
