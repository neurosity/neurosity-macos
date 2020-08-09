const { Menu } = require("electron");
const { BehaviorSubject } = require("rxjs");
const { statesLabels } = require("./status");
const { notion } = require("./notion");
const { settingsLabels } = require("./settings");

class ReactiveTrayMenu {
  constructor(tray, initialState) {
    this.tray = tray;
    this.menuState = new BehaviorSubject(initialState);
    this.rebuildOnChange();
  }

  rebuildOnChange() {
    this.menuState.asObservable().subscribe((template) => {
      const contextMenu = Menu.buildFromTemplate(template);
      this.tray.setContextMenu(contextMenu);
    });
  }

  setState(setter) {
    const prevValue = this.menuState.getValue();
    const nextValue = setter(prevValue);
    this.menuState.next(nextValue);
  }

  setSelectedDevice(device) {
    this.setState((menu) => {
      return menu.map((item) => {
        if (item.id === "selectedDevice") {
          item.label = device.deviceNickname;
        }
        if (item.id === "myDevices") {
          item.submenu.forEach((submenuItem) => {
            submenuItem.checked = submenuItem.id === device.deviceId;
          });
        }
        return item;
      });
    });
  }

  setDevices(devices, selectedDevice) {
    this.setState((menu) => {
      const item = menu.find((item) => item.id === "myDevices");

      item.submenu = devices.map((device) => ({
        id: device.deviceId,
        type: "radio",
        checked: selectedDevice?.deviceId === device.deviceId,
        label: device.deviceNickname,
        click: () => {
          notion.selectDevice(["deviceId", device.deviceId]);
        }
      }));

      return menu;
    });
  }

  setDeviceInfo(info) {
    this.setState((menu) => {
      const item = menu.find((item) => item.id === "deviceInfo");

      item.submenu = Object.entries(info).map(([key, value]) => ({
        id: `info-${key}`,
        label: `${key}: ${value}`,
        enabled: false
      }));

      return menu;
    });
  }

  setStatus(status) {
    this.setState((menu) => {
      return menu.map((item) => {
        if (item.id === "status") {
          item.label = `${statesLabels[status.state]} ${
            status.sleepMode ? "(sleep mode)" : ""
          }`;
        }
        if (item.id === "battery") {
          item.label = `Battery ${status.battery}% ${
            status.charging ? "🔌" : ""
          }`;
        }
        return item;
      });
    });
  }

  setDeviceSettings(settings) {
    this.setState((menu) => {
      const item = menu.find((item) => item.id === "deviceSettings");

      item.submenu = Object.entries(settings).map(([key, checked]) => ({
        id: `setting-${key}`,
        type: "checkbox",
        label: key in settingsLabels ? settingsLabels[key] : key,
        checked,
        click: (item) => {
          notion.changeSettings({
            [key]: item.checked
          });
        }
      }));

      return menu;
    });
  }

  setSelectedMetric(metric) {
    this.setState((menu) => {
      return menu.map((item) => {
        if ("type" in item && item.type === "checkbox") {
          item.checked = metric ? metric === item.id : false;
        }
        return item;
      });
    });
  }
}

module.exports = {
  ReactiveTrayMenu
};
