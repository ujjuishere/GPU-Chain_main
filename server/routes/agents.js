const express = require("express");
const { getAgents } = require("../state/agents");

const router = express.Router();

router.get("/", (req, res) => {
  const agents = getAgents();
  res.json(
    Object.entries(agents).map(([id, a]) => ({
      agentId: id,
      status: a.status,
      gpus: a.gpus,
      system: a.system,
      lastSeen: a.lastSeen
    }))
  );
});

module.exports = router;
