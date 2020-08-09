import { render, createElement } from "../web_modules/preact.js";
import htm from "../web_modules/htm.js";
import { App } from "./components/App.js";

const html = htm.bind(createElement);

render(html` <${App} /> `, document.getElementById("root"));
