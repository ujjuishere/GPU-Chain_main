const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080/ws");

const AGENT_ID = "agent-test-1";

ws.on("open", () => {
  console.log("🟢 Agent connected");

  ws.send(JSON.stringify({
    type: "hello",
    agentId: AGENT_ID
  }));

  setInterval(() => {
    ws.send(JSON.stringify({
      type: "stats",
      agentId: AGENT_ID,
      status: "idle",
      gpus: [{ name: "RTX 3060", memory: "12GB" }],
      system: { cpu: "20%", ram: "40%" }
    }));
  }, 3000);
});

ws.on("message", msg => {
  console.log("📨 From server:", msg.toString());
});
