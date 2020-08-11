const SysTray = require("systray").default;
const path = require("path");
const fs = require("fs");

const icon = fs.readFileSync(
  path.join(__dirname, `./images/icon-neurosity@2x.png`)
);

const systray = new SysTray({
  menu: {
    // you should using .png icon in macOS/Linux, but .ico format in windows
    icon: icon.toString("base64"),
    title: "Test",
    tooltip: "Tips",
    items: [
      {
        title: "aa",
        tooltip: "bb",
        // checked is implement by plain text in linux
        checked: true,
        enabled: true
      },
      {
        title: "aa2",
        tooltip: "bb",
        checked: false,
        enabled: true
      },
      {
        title: "Exit",
        tooltip: "bb",
        checked: false,
        enabled: true
      }
    ]
  },
  debug: false,
  copyDir: true // copy go tray binary to outside directory, useful for packing tool like pkg.
});

setInterval(() => {
  //systray
}, 1000);

console.log(systray);

systray.onClick((action) => {
  if (action.seq_id === 0) {
    systray.sendAction({
      type: "update-item",
      item: {
        ...action.item,
        checked: !action.item.checked
      },
      seq_id: action.seq_id
    });
  } else if (action.seq_id === 1) {
    // open the url
    console.log("open the url", action);
  } else if (action.seq_id === 2) {
    systray.kill();
  }
});
