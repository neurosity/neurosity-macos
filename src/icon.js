const { nativeImage } = require("electron");
const nodeHtmlToImage = require("node-html-to-image");
const path = require("path");
const fs = require("fs");

const icon = fs.readFileSync(
  path.join(__dirname, "..", "images", "icon-neurosity@2x.png")
);

const iconDataURI =
  "data:image/png;base64," + new Buffer.from(icon).toString("base64");

const defaultIcon = path.join(
  __dirname,
  "..",
  "images",
  "icon-neurosity.png"
);

async function getIcon(dynamicContent = {}) {
  const imageBuffer = await nodeHtmlToImage({
    transparent: true,
    content: { iconDataURI, ...dynamicContent },
    html: `
      <html>
        <head>
          <style>
            body { font-family: Roboto, sans-serif; font-size: 23px; width: 100px; height: 32px; }
          </style>
        </head>
        <body>
          <div style="display: flex; align-items: center;">
            <img src="{{iconDataURI}}" width="32" height="32" style="padding-left: 4px;" />
            <span style="width: 64px; text-align:center; padding-top: 1px;">{{score}}%</span>
          </div>
        </body>
      </html>
    `
  });
  const image = nativeImage.createFromBuffer(imageBuffer, {
    scaleFactor: 2
  });
  return image;
}

module.exports = {
  getIcon,
  defaultIcon
};
