const { Notion } = require("@neurosity/notion");
const { Tray, app } = require("electron");
const { BehaviorSubject } = require("rxjs");
const { withLatestFrom, share } = require("rxjs/operators");
const { switchMap, flatMap, filter } = require("rxjs/operators");
const { getIcon, defaultIcon } = require("./src/icon");
const { averageScoreBuffer } = require("./src/utils");
const { ReactiveTrayMenu } = require("./src/menu");
const { streamReady } = require("./src/status");
const { argv } = require("yargs");

let tray = null;
const notion = new Notion();
const selectedMetric = new BehaviorSubject(null);
const { email, password } = argv;

app.on("ready", async () => {
  tray = new Tray(defaultIcon);
  tray.setToolTip("Neurosity macOS");

  const menu = new ReactiveTrayMenu(tray, getInitialMenu());

  // hack metric checkbox to work as radios since it's buggy
  tray.on("click", () => {
    menu.setSelectedMetric(selectedMetric.getValue());
  });

  if (!email || !password) {
    return console.error("Please login by passing email and password.");
  }

  const { selectedDevice } = await notion.login({ email, password });

  const devices = await notion.getDevices();

  menu.setDevices(devices, selectedDevice, notion);

  notion.onDeviceChange().subscribe((device) => {
    menu.setSelectedDevice(device);
  });

  const status$ = notion.status().pipe(share());

  status$.subscribe((status) => {
    menu.setStatus(status);
  });

  // updates tray icon with selected metric
  selectedMetric
    .asObservable()
    .pipe(
      filter((selectedMetric) => !!selectedMetric),
      switchMap((selectedMetric) =>
        notion[selectedMetric]().pipe(averageScoreBuffer())
      ),
      flatMap((score) => getIcon({ score })), // to icon
      withLatestFrom(status$)
    )
    .subscribe(([iconWithMetric, status]) => {
      if (streamReady(status)) {
        tray.setImage(iconWithMetric);
      } else {
        tray.setImage(defaultIcon);
      }
    });
});

function getInitialMenu() {
  return [
    {
      id: "selectedDevice",
      enabled: false,
      label: "Loggin in..."
    },
    {
      id: "status",
      enabled: false,
      label: "Status"
    },
    {
      id: "battery",
      enabled: false,
      label: "Battery"
    },
    { type: "separator" },
    {
      id: "focus",
      label: "Show Focus",
      type: "checkbox",
      checked: false,
      click: (item) => {
        selectedMetric.next(item.checked ? "focus" : null);
      }
    },
    {
      id: "calm",
      label: "Show Calm",
      type: "checkbox",
      checked: false,
      click: (item) => {
        selectedMetric.next(item.checked ? "calm" : null);
      }
    },
    { type: "separator" },
    {
      id: "myDevices",
      label: "My Devices",
      submenu: [{ label: "loading... ", enabled: false }]
    },
    { type: "separator" },
    {
      id: "quit",
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ];
}
