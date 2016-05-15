const expect = require('chai').expect;
const fs = require('fs');
const jsdomify = require('jsdomify');

describe('index.html test suite', function () {
  before(function (done) {
    fs.readFile("index.html", 'utf8', function (err, file) {
      if (err) {
        return done('Error');
      }
      jsdomify.default.create(file);
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
