const { Notion } = require("@neurosity/notion");
const { BehaviorSubject } = require("rxjs");

const notion = new Notion();
const selectedMetric = new BehaviorSubject(null);

module.exports = {
  notion,
  selectedMetric
};
