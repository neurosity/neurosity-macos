const { app, shell } = require("electron");
const { notion, selectedMetric } = require("./notion");
const { deleteAuth } = require("./auth");

const quitMenuItem = {
  id: "quit",
  label: "Quit",
  click: () => {
    app.quit();
  }
};

const separator = { type: "separator" };

const apps = [
  {
    id: "dev-console",
    label: "Developer Console",
    click: () => {
      shell.openExternal("https://console.neurosity.co");
    }
  },
  {
    id: "vscode-extension",
    label: "Developer Assistant",
    click: () => {
      shell.openExternal(
        "https://marketplace.visualstudio.com/items?itemName=neurosity.plugin-vscode-notion"
      );
    }
  },
  {
    id: "notion-ocean",
    label: "Notion Ocean",
    click: () => {
      shell.openExternal("https://ocean.neurosity.co");
    }
  },
  {
    id: "think-to-scroll",
    label: "Think to Scroll",
    click: () => {
      shell.openExternal("https://thinktoscroll.com");
    }
  }
];

function getLoginMenu(loginWindow) {
  return [
    {
      id: "login",
      enabled: true,
      label: "Neurosity Login",
      click: () => {
        loginWindow.show();
      }
    },
    separator,
    quitMenuItem
  ];
}

function getAuthenticatedMenu(loginWindow) {
  return [
    {
      id: "selectedDevice",
      enabled: false,
      label: "Notion"
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
    {
      id: "deviceInfo",
      label: "Info",
      submenu: [{ label: "loading... ", enabled: false }]
    },
    separator,
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
    separator,
    {
      id: "myDevices",
      label: "My Devices",
      submenu: [{ label: "loading... ", enabled: false }]
    },
    {
      id: "apps",
      label: "Apps",
      submenu: apps
    },
    separator,
    {
      id: "logout",
      enabled: true,
      label: "Logout",
      click: () => {
        notion.logout().then(() => {
          loginWindow.webContents.send("logout");
          deleteAuth();
        });
      }
    },
    quitMenuItem
  ];
}

module.exports = {
  getLoginMenu,
  getAuthenticatedMenu
};
