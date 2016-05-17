const expect = require('chai').expect;
const fs = require('fs');
const jsdom = require('jsdom');
const electron = require("electron");

var window;
var document;
describe('index.html test suite', function () {
  before(function (done) {
    window = jsdom.jsdom(fs.readFileSync('index.html'), {
      features: {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script']
      }
    }).defaultView;

    window.require = require;
    document = window.document;
    window.addEventListener('load', function () {
      console.log(window.document.body.innerHTML);
      done();
    });
  });
  it('toggles the task overlay', function () {
    var switchTaskButton = document.getElementById("switch-task-button");
    var taskOverlay = document.getElementById("task-overlay");
    expect(taskOverlay.hidden).to.be.true;
    switchTaskButton.click();
    expect(taskOverlay.hidden).to.be.false;
  });
});
