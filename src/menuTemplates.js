const { app } = require("electron");

const quitMenuItem = {
  id: "quit",
  label: "Quit",
  click: () => {
    app.quit();
  }
};

const separator = { type: "separator" };

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

function getAuthenticatedMenu(selectedMetric) {
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
    separator,
    quitMenuItem
  ];
}

module.exports = {
  getLoginMenu,
  getAuthenticatedMenu
};
