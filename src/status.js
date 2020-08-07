const statesLabels = {
  booting: "Starting OS...",
  shuttingOff: "Shutting off...",
  updating: "Updating OS...",
  online: "Online",
  offline: "Offline"
};

function streamReady(status) {
  return status.state === "online" && !status.sleepMode;
}

module.exports = { statesLabels, streamReady };
