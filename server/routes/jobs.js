const express = require("express");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { pickIdleAgent } = require("../scheduler/scheduler");
const { createJob, getJob } = require("../state/jobs");

const router = express.Router();

router.post("/", (req, res) => {
  const { dockerfile } = req.body;
  if (!dockerfile) {
    return res.status(400).json({ error: "dockerfile required" });
  }

  const picked = pickIdleAgent();
  if (!picked) {
    return res.status(503).json({ error: "No idle agents available" });
  }

  const [agentId, agent] = picked;
  const jobId = uuidv4();

  createJob(jobId, agentId);
  agent.status = "busy";

  try {
    agent.ws.send(JSON.stringify({
      type: "runJob",
      jobId,
      dockerfile
    }));
  } catch (err) {
    logger.error("Failed to send job to agent");
    return res.status(500).json({ error: "Agent disconnected" });
  }

  logger.info(`Job ${jobId} dispatched to ${agentId}`);
  res.json({ jobId, agentId });
});

router.get("/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

module.exports = router;
