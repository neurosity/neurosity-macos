const { Notion } = require("@neurosity/notion");
const { notion } = require("./notion");
const { store } = require("./store");

function persistAuth() {
  const currentUser = notion.__getApp().auth().currentUser;
  store.set("user-session", currentUser);
}

function reviveAuth() {
  const userData = store.get("user-session");

  if (userData) {
    const user = Notion.createUser(
      userData,
      userData.stsTokenManager,
      userData
    );
    notion.__getApp().auth().updateCurrentUser(user);
  }
}

function deleteAuth() {
  store.delete("user-session");
}

module.exports = {
  persistAuth,
  reviveAuth,
  deleteAuth
};
