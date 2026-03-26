const agents = {};

function registerAgent(agentId, ws) {
  agents[agentId] = {
    ws,
    status: "unknown",
    gpus: [],
    system: {},
    lastSeen: Date.now()
  };
}

function updateAgent(agentId, data) {
  if (!agents[agentId]) return;
  Object.assign(agents[agentId], data, { lastSeen: Date.now() });
}

function removeAgentBySocket(ws) {
  for (const id in agents) {
    if (agents[id].ws === ws) {
      delete agents[id];
      return id;
    }
  }
}

function getAgents() {
  return agents;
}

module.exports = {
  registerAgent,
  updateAgent,
  removeAgentBySocket,
  getAgents
};
