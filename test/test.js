"use strict";
var expect = require("chai").expect;
var date = require("../public/js/date.js");

describe("Date", function() {
  it("Date displayed is a string", function() {
    expect(date()).to.be.a('string');
  });
  
});