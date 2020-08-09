import { createElement } from "../../../web_modules/preact.js";
import htm from "../../../web_modules/htm.js";

const html = htm.bind(createElement);

import { Form } from "./Form.js";

export function App() {
  return html`
    <div class="main">
      <img class="logo" height="100" src="assets/logo.png" />
      <${Form} />
    </div>
  `;
}
