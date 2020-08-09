const { notion, selectedMetric } = require("./src/notion");
const { Tray, BrowserWindow, ipcMain, app } = require("electron");
const { withLatestFrom, share } = require("rxjs/operators");
const { switchMap, flatMap, filter } = require("rxjs/operators");
const { getIcon, defaultIcon } = require("./src/icon");
const { averageScoreBuffer } = require("./src/utils");
const { ReactiveTrayMenu } = require("./src/menu");
const { streamReady } = require("./src/status");
const {
  getLoginMenu,
  getAuthenticatedMenu
} = require("./src/menuTemplates");

let tray = null;
let loginWindow = null;

app.on("ready", async () => {
  tray = new Tray(defaultIcon);
  tray.setToolTip("Neurosity macOS");

  loginWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  loginWindow.loadFile("./src/login.html");

  loginWindow.on("close", (e) => {
    e.preventDefault();
    loginWindow.hide();
  });

  const menu = new ReactiveTrayMenu(tray, getLoginMenu(loginWindow));

  // hack metric checkbox to work as radios since it's buggy
  tray.on("click", () => {
    menu.setSelectedMetric(selectedMetric.getValue());
  });

  app.on("window-all-closed", (e) => e.preventDefault());

  ipcMain.on("open-tray-menu", () => {
    tray.popUpContextMenu();
  });

  ipcMain.on("login-submit", (event, credentials) => {
    notion
      .login(credentials)
      .then(() => {
        event.reply("login-response", { ok: true });
      })
      .catch((error) => {
        event.reply("login-response", {
          ok: false,
          error: error.message
        });
      });
  });

  notion.onAuthStateChanged().subscribe(async (auth) => {
    if (!auth) {
      menu.setState(() => getLoginMenu(loginWindow));
      return;
    }

    menu.setState(() => getAuthenticatedMenu(loginWindow));

    const { selectedDevice } = auth;
    const devices = await notion.getDevices();

    menu.setDevices(devices, selectedDevice);

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
});
