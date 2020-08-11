const { BehaviorSubject, of, empty, concat } = require("rxjs");
const { switchMap, share, map } = require("rxjs/operators");
const { distinctUntilChanged } = require("rxjs/operators");
const { delay, filter } = require("rxjs/operators");
const doNotDisturb = require("@sindresorhus/do-not-disturb");
const { selectedMetric } = require("./selectedMetric");
const { selectedMetricScore$ } = require("./selectedMetric");

const doNotDisturbSubject = new BehaviorSubject(null);

const doNotDisturb$ = doNotDisturbSubject.asObservable().pipe(
  filter((setting) => !!setting),
  switchMap((setting) => {
    if (setting === "off") {
      return of(false);
    }

    if (setting === "for1Hour") {
      return concat(
        of(true),
        of(false).pipe(
          delay(100) // 1 hour
        )
      );
    }

    if (setting === "whileInTheZone") {
      if (!selectedMetric.getValue()) {
        selectedMetric.next("focus");
      }

      return selectedMetricScore$.pipe(
        map((score) => !!(score > 60)),
        distinctUntilChanged()
      );
    }

    return empty();
  }),
  share()
);

function syncDoToDisturb() {
  return doNotDisturb$.subscribe((enable) => {
    if (enable) {
      doNotDisturb.enable();
    } else {
      doNotDisturb.disable();
    }
  });
}

module.exports = {
  doNotDisturbSubject,
  syncDoToDisturb
};
