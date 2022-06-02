const { shell } = require("electron");
const { notion } = require("./notion");
const { deleteAuth } = require("./auth");
const { selectedMetric } = require("./selectedMetric");
const { doNotDisturbCheckboxSubject } = require("./doNotDisturb");

const separator = { type: "separator" };

const apps = [
  {
    id: "shift",
    label: "Neurosity Shift",
    submenu: [
      {
        label: "On the App Store",
        click: () => {
          shell.openExternal("https://apps.apple.com/au/app/neurosity/id1538516914");
        }
      },
      {
        label: "On Google Play",
        click: () => {
          shell.openExternal("https://play.google.com/store/apps/details?id=com.neurosity");
        }
      }
    ]
  },
  {
    id: "music",
    label: "Neurosity Music",
    click: () => {
      shell.openExternal("https://music.neurosity.co");
    }
  },
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
    {
      id: "quit",
      label: "Quit",
      click: () => {
        loginWindow.destroy();
      }
    }
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
    {
      id: "deviceSettings",
      label: "Settings",
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
    // {
    //   id: "doNotDisturb",
    //   label: "Do not disturb when I'm focused",
    //   type: "checkbox",
    //   checked: false,
    //   click: (item) => {
    //     doNotDisturbCheckboxSubject.next(item.checked);
    //   }
    // },
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
    {
      id: "docs",
      label: "Docs",
      click: () => {
        shell.openExternal("https://docs.neurosity.co");
      }
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
    {
      id: "quit",
      label: "Quit",
      click: () => {
        loginWindow.destroy();
      }
    }
  ];
}

module.exports = {
  getLoginMenu,
  getAuthenticatedMenu
};
