const { nativeTheme } = require("electron");
const { fromEvent } = require("rxjs");
const { map, share, startWith } = require("rxjs/operators");

function onThemeUpdated() {
  return fromEvent(nativeTheme, "updated").pipe(
    map((event) => getTheme(event.sender.shouldUseDarkColors)),
    startWith(getTheme(nativeTheme.shouldUseDarkColors)),
    share()
  );
}

function getTheme(shouldUseDarkColors) {
  return shouldUseDarkColors ? "dark" : "light";
}

module.exports = { onThemeUpdated };
