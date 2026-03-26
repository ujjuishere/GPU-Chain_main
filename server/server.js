// const express = require("express");
// const http = require("http");
// const { PORT } = require("./config/constants");
// const setupAgentSocket = require("./ws/agentSocket");

// const app = express();
// app.use(express.json());

// const server = http.createServer(app);

// setupAgentSocket(server);

// app.use("/api/agents", require("./routes/agents"));
// app.use("/api/jobs", require("./routes/jobs"));

// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`Backend running on http://0.0.0.0:${PORT}`);
// });


const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = 8080;

const now = () => new Date().toISOString();
const log = (...args) => console.log(`[${now()}]`, ...args);
const warn = (...args) => console.warn(`[${now()}][WARN]`, ...args);
const error = (...args) => console.error(`[${now()}][ERROR]`, ...args);


const app = express();
app.use(express.json());

const cors = require('cors');
   app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });


const agents = {}; // agentId -> { ws, status, gpus, system, lastSeen }
const jobs = {};   // jobId -> { status, logs, agentId }



wss.on("connection", (ws, req) => {
  log(" WebSocket connection opened", req.socket.remoteAddress);

  ws.on("message", (raw) => {
    log(" WS raw message:", raw.toString());

    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (e) {
      error(" Invalid JSON from agent:", e.message);
      return;
    }

    log(" WS parsed message:", msg);

    /* ---------- HELLO ---------- */
    if (msg.type === "hello") {
      if (!msg.agentId) {
        warn(" HELLO without agentId");
        return;
      }

      agents[msg.agentId] = {
        ws,
        status: "idle",
        gpus: [],
        system: {},
        lastSeen: Date.now()
      };

      log(` Agent registered: ${msg.agentId}`);
      log(" Current agents:", Object.keys(agents));
      return;
    }

    /* ---------- STATS ---------- */
    if (msg.type === "stats") {
      const agent = agents[msg.agentId];
      if (!agent) {
        warn(" Stats from unknown agent:", msg.agentId);
        return;
      }

      agent.status = msg.status;
      agent.gpus = msg.gpus || [];
      agent.system = msg.system || {};
      agent.lastSeen = Date.now();

      log(` Stats updated for ${msg.agentId}`);
      log("GPU:", agent.gpus);
      log("System:", agent.system);
      return;
    }

    /* ---------- JOB RESULT ---------- */
    if (msg.type === "jobResult") {
      const job = jobs[msg.jobId];
      if (!job) {
        warn(" JobResult for unknown job:", msg.jobId);
        return;
      }

      job.status = msg.status;
      job.logs = msg.logs;
      job.finishedAt = Date.now();

      const agent = agents[msg.agentId];
      if (agent) agent.status = "idle";

      log(` Job finished`);
      log("Job ID:", msg.jobId);
      log("Agent:", msg.agentId);
      log("Status:", msg.status);
      log("Logs:\n", msg.logs);

      return;
    }

  
    if (msg.type === "pong") {
      const agent = agents[msg.agentId];
      if (!agent) {
        warn(" Pong from unknown agent:", msg.agentId);
        return;
      }

      agent.lastSeen = Date.now();
      log(` Pong received from ${msg.agentId}`);
      return;
    }

    warn(" Unknown WS message type:", msg.type);
  });

  ws.on("close", () => {
    log(" WebSocket closed");

    for (const id in agents) {
      if (agents[id].ws === ws) {
        log(` Agent disconnected: ${id}`);
        delete agents[id];
        log(" Remaining agents:", Object.keys(agents));
        break;
      }
    }
  });

  ws.on("error", (err) => {
    error("WebSocket error:", err.message);
  });
});



function pickIdleAgent() {
  log(" Scheduler invoked");

  const entries = Object.entries(agents);
  log("Agents snapshot:", entries.map(([id, a]) => ({
    id,
    status: a.status,
    lastSeen: a.lastSeen
  })));

  const picked = entries.find(
    ([_, agent]) => agent.status === "idle"
  );

  if (!picked) {
    warn(" No idle agent found");
  } else {
    log("Picked idle agent:", picked[0]);
  }

  return picked;
}



app.get("/api/agents", (req, res) => {
  log(" GET /api/agents");

  const list = Object.entries(agents).map(([id, a]) => ({
    agentId: id,
    status: a.status,
    gpus: a.gpus,
    system: a.system,
    lastSeen: a.lastSeen
  }));

  log("📤 Responding with agents:", list);
  res.json(list);
});


app.post("/api/jobs", (req, res) => {
  log("📡 POST /api/jobs");
  log("📥 Request body:", req.body);

  const { dockerfile } = req.body;
  if (!dockerfile) {
    warn(" dockerfile missing in request");
    return res.status(400).json({ error: "dockerfile required" });
  }

  const picked = pickIdleAgent();
  if (!picked) {
    warn(" Job rejected: no idle agents");
    return res.status(503).json({ error: "No idle agents available" });
  }

  const [agentId, agent] = picked;
  const jobId = uuidv4();

  jobs[jobId] = {
    jobId,
    agentId,
    status: "running",
    logs: "",
    createdAt: Date.now()
  };

  agent.status = "busy";

  const payload = {
    type: "runJob",
    jobId,
    dockerfile
  };

  log("Sending job to agent:", agentId);
  log("Payload:", payload);

  agent.ws.send(JSON.stringify(payload));

  log(` Job dispatched`);
  log("Job ID:", jobId);
  log("Agent:", agentId);

  res.json({ jobId, agentId });
});


app.get("/api/jobs/:id", (req, res) => {
  const jobId = req.params.id;
  log(` GET /api/jobs/${jobId}`);

  const job = jobs[jobId];
  if (!job) {
    warn(" Job not found:", jobId);
    return res.status(404).json({ error: "Job not found" });
  }

  log("Returning job:", job);
  res.json(job);
});

server.listen(PORT, "0.0.0.0", () => {
  log(` Backend running on http://0.0.0.0:${PORT}`);
});
