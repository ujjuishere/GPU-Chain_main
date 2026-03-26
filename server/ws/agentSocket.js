const WebSocket = require("ws");
const logger = require("../utils/logger");
const {
  registerAgent,
  updateAgent,
  removeAgentBySocket
} = require("../state/agents");
const { completeJob } = require("../state/jobs");

function setupAgentSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    logger.info("Agent connected");

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        logger.error("Invalid JSON from agent");
        return;
      }

      if (msg.type === "hello") {
        registerAgent(msg.agentId, ws);
        logger.info("Registered agent:", msg.agentId);
      }

      if (msg.type === "stats") {
        updateAgent(msg.agentId, {
          status: msg.status,
          gpus: msg.gpus || [],
          system: msg.system || {}
        });
      }

      if (msg.type === "jobResult") {
        completeJob(msg.jobId, msg.status, msg.logs);
        updateAgent(msg.agentId, { status: "idle" });
        logger.info(`Job ${msg.jobId} finished`);
      }

      if (msg.type === "pong") {
        updateAgent(msg.agentId, {});
      }
    });

    ws.on("close", () => {
      const id = removeAgentBySocket(ws);
      if (id) logger.warn("Agent disconnected:", id);
    });
  });
}

module.exports = setupAgentSocket;
