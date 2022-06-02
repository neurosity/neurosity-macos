const { notion } = require("./src/notion");
const { persistAuth, reviveAuth } = require("./src/auth");
const { Tray, BrowserWindow, ipcMain, app } = require("electron");
const { withLatestFrom, share, tap } = require("rxjs/operators");
const { selectedMetricScore$ } = require("./src/selectedMetric");
const { getIcon, defaultIcon } = require("./src/icon");
const { getAuthenticatedMenu } = require("./src/menuTemplates");
const { ReactiveTrayMenu } = require("./src/menu");
const {
  syncDoToDisturb,
  doNotDisturbCheckbox$
} = require("./src/doNotDisturb");
const { selectedMetric } = require("./src/selectedMetric");
const { getLoginMenu } = require("./src/menuTemplates");
const { streamReady } = require("./src/status");

const path = require("path");
const isDev = require("electron-is-dev");

let tray = null;
let loginWindow = null;

app.on("ready", async () => {
  tray = new Tray(defaultIcon);
  tray.setToolTip("Neurosity macOS");

  reviveAuth();

  loginWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  loginWindow.loadURL(
    isDev
      ? `file://${path.join(__dirname, "src/login/login.html")}`
      : `file://${path.join(__dirname, "build/src/login/login.html")}`
  );

  loginWindow.on("close", (e) => {
    e.preventDefault();
    loginWindow.hide();
  });

  const menu = new ReactiveTrayMenu(tray, getLoginMenu(loginWindow));

  // hack metric checkbox to work as radios since it's buggy
  tray.on("click", () => {
    menu.setSelectedMetric(selectedMetric.getValue());
  });

  ipcMain.on("open-tray-menu", () => {
    tray.popUpContextMenu();
  });

  ipcMain.on("login-submit", (event, credentials) => {
    notion
      .login(credentials)
      .then(() => {
        event.reply("login-response", { ok: true });
        persistAuth();
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
      notion.getInfo().then((info) => {
        menu.setDeviceInfo(info);
      });
    });

    const status$ = notion.status().pipe(share());

    status$.subscribe((status) => {
      menu.setStatus(status);
    });

    // updates tray icon with selected metric
    selectedMetricScore$
      .pipe(
        withLatestFrom(status$),
        tap(([score, status]) => {
          console.log("selectedMetricScore$", { score, status });
        })
      )
      .subscribe(async ([score, status]) => {
        const iconWithMetric = await getIcon({ score });

        if (streamReady(status)) {
          tray.setImage(iconWithMetric);
        } else {
          tray.setImage(defaultIcon);
        }
      });
  });

  notion.settings().subscribe((settings) => {
    menu.setDeviceSettings(settings);
  });

  // syncDoToDisturb();

  // doNotDisturbCheckbox$.subscribe((enabled) => {
  //   menu.setDoNotDisturb(enabled);
  // });
});
