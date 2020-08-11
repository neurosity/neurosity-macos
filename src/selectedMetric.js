const { BehaviorSubject } = require("rxjs");
const { filter, switchMap, share } = require("rxjs/operators");
const { averageScoreBuffer } = require("./utils");
const { notion } = require("./notion");

const selectedMetric = new BehaviorSubject(null);

const selectedMetricScore$ = selectedMetric.asObservable().pipe(
  filter((selectedMetric) => !!selectedMetric),
  switchMap((selectedMetric) =>
    notion[selectedMetric]().pipe(averageScoreBuffer())
  ),
  share()
);

module.exports = {
  selectedMetric,
  selectedMetricScore$
};
