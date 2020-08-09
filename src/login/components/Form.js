import { createElement } from "../../../web_modules/preact.js";
import {
  useState,
  useEffect
} from "../../../web_modules/preact/hooks.js";
import htm from "../../../web_modules/htm.js";
const { ipcRenderer, remote } = require("electron");

import { useForm } from "../hooks/useForm.js";

const html = htm.bind(createElement);

const defaultForm = {
  email: "",
  password: ""
};

export function Form() {
  const form = useForm(defaultForm, onSubmit);

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const disabled = loggingIn;

  useEffect(() => {
    ipcRenderer.on("logout", () => {
      setLoggedIn(false);
    });
  }, []);

  async function onSubmit() {
    setError("");
    setLoggingIn(true);

    ipcRenderer.send("login-submit", form.values);
    ipcRenderer.on("login-response", (_, response) => {
      setLoggingIn(false);
      if (response.ok) {
        setLoggedIn(true);
        form.reset();
      } else {
        setError(response.error);
      }
    });
  }

  function openApp() {
    const window = remote.getCurrentWindow();
    ipcRenderer.send("open-tray-menu");
    window.close();
  }

  if (loggedIn) {
    return html`
      <div class="message">
        <h3>You are now logged in.</h3>
        <br />
        <button class="button" onClick=${openApp}>Open App</button>
      </div>
    `;
  }

  return html`
    <form class="form-container" onSubmit=${form.onSubmit}>
      ${error ? html`<h3>${error}</h3>` : null}
      <input
        class="input-box"
        type="email"
        name="email"
        value=${form.values.email}
        onInput=${form.onChange}
        placeholder="Email"
        disabled=${disabled}
        required
      />
      <input
        class="input-box"
        type="password"
        name="password"
        value=${form.values.password}
        onInput=${form.onChange}
        placeholder="Password"
        disabled=${disabled}
        required
      />
      <button class="button" type="submit" disabled=${disabled}>
        ${loggingIn ? "Logging in..." : "Log in"}
      </button>
    </form>
  `;
}
