const { BehaviorSubject, of, NEVER } = require("rxjs");
const { switchMap, share, distinctUntilChanged } = require("rxjs/operators");
const { averageScoreBuffer } = require("./utils");
const { notion } = require("./notion");

const selectedMetric = new BehaviorSubject(null);

const selectedMetricScore$ = selectedMetric.asObservable().pipe(
  switchMap((selectedMetric) => {
    if (!selectedMetric) {
      return of(NEVER);
    }

    return notion[selectedMetric]().pipe(
      averageScoreBuffer()
    )
  }),
  distinctUntilChanged(),
  share()
);

module.exports = {
  selectedMetric,
  selectedMetricScore$
};
