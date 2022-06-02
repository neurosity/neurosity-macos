const sendKeys = require("sendkeys-macos");
const { BehaviorSubject, of } = require("rxjs");
const { switchMap, share, map, skip, tap } = require("rxjs/operators");
const { distinctUntilChanged, startWith } = require("rxjs/operators");
const { selectedMetric } = require("./selectedMetric");
const { selectedMetricScore$ } = require("./selectedMetric");

const doNotDisturbCheckboxSubject = new BehaviorSubject(null);

const doNotDisturbCheckbox$ = doNotDisturbCheckboxSubject.asObservable().pipe(
  skip(1),
  share()
);

function syncDoToDisturb() {
  return doNotDisturbCheckbox$
    .pipe(
      switchMap((enabled) => {
        if (!enabled) {
          return of(false);
        }

        return selectedMetricScore$.pipe(
          startWith(0),
          tap(() => {
            selectedMetric.next("focus");
          }),
          map((score) => !!(score > 60)),
          distinctUntilChanged()
        );
      })
    )
    .subscribe((enabled) => {
      console.log("syncDoToDisturb", enabled);

      if (enabled) {
        toggleDoToDisturb();
      } else {
        toggleDoToDisturb();
      }
    });
}

function toggleDoToDisturb(shortcut = "<c:f:option,shift>") {
  sendKeys(null, shortcut);
}

module.exports = {
  doNotDisturbCheckboxSubject,
  syncDoToDisturb,
  doNotDisturbCheckbox$
};
