const { getAgents } = require("../state/agents");

function pickIdleAgent() {
  return Object.entries(getAgents()).find(
    ([_, agent]) => agent.status === "idle"
  );
}

module.exports = { pickIdleAgent };
