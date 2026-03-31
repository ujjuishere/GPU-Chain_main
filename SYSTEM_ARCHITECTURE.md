# Remote GPU Rental System - Complete Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Components Overview](#components-overview)
5. [Data Models](#data-models)
6. [API Reference](#api-reference)
7. [Communication Protocols](#communication-protocols)
8. [Data Flow & Workflows](#data-flows--workflows)
9. [Key Terms Glossary](#key-terms-glossary)
10. [Current Implementation Status](#current-implementation-status)

---

## Executive Summary

**GPU Rental System** is a distributed compute orchestration platform designed to manage, monitor, and execute GPU-accelerated workloads across a network of GPU agents. Built with a modern web stack (React + Express + Node.js), it enables users to submit containerized jobs (via Docker) that are dynamically scheduled and executed on available GPU hardware, with real-time monitoring and result retrieval.

**Core Value Proposition:**
- Submit GPU jobs remotely via web UI
- Automatic agent selection & load distribution
- Real-time GPU metrics monitoring
- Containerized job execution (Docker)
- Scalable to multiple GPU agents

---

## System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER BROWSER LAYER                          │
│                   (Frontend: React + Vite)                       │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    HTTP + WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      API SERVER LAYER                            │
│              (Express.js on Node.js, Port 8080)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REST API Routes                                           │ │
│  │  - GET  /api/agents                                        │ │
│  │  - POST /api/jobs                                          │ │
│  │  - GET  /api/jobs/:id                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  WebSocket Hub (/ws)                                       │ │
│  │  - Bidirectional agent ↔ server communication             │ │
│  │  - Event-driven message handling                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  In-Memory State Store                                     │ │
│  │  - agents{} : Agent registry with status & metrics         │ │
│  │  - jobs{}   : Job queue with execution results             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Job Scheduler                                             │ │
│  │  - Agent selection logic                                   │ │
│  │  - Job assignment & status tracking                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    WebSocket Connections
                    (One per active agent)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    GPU AGENT LAYER                               │
│              (Multiple Node.js processes)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Agent Service                                             │ │
│  │  - WebSocket client connection to server                   │ │
│  │  - GPU hardware interface (nvidia-smi integration)         │ │
│  │  - Docker runtime for job execution                        │ │
│  │  - Metrics & result reporting                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Hardware Resources                                        │ │
│  │  - GPU(s) (NVIDIA, AMD, etc.)                              │ │
│  │  - CPU cores & system memory                               │ │
│  │  - Docker daemon                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Conceptual Layer Breakdown

| Layer | Role | Technology | Key Responsibility |
|-------|------|-----------|-------------------|
| **Presentation** | User Interface | React 19.2, Vite 7.2, TailwindCSS 4.1 | Job submission, GPU metrics visualization, user authentication UI |
| **Application** | API & Orchestration | Express 4.19, Node.js, WS 8.16 | Request validation, job scheduling, agent management, WebSocket coordination |
| **Persistence** | State Storage | In-Memory (JavaScript objects) | Agent registry, job queue, metrics cache |
| **Execution** | Compute & Monitoring | Docker, nvidia-smi, Node.js child_process | Job execution, hardware monitoring, result collection |

---

## Technology Stack

### **Frontend Stack**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | Component-based UI framework |
| **Vite** | 7.2.4 | Build tool, dev server, bundler |
| **TailwindCSS** | 4.1.18 | Utility-first CSS framework for styling |
| **Lucide-react** | 0.562.0 | Icon library (SVG-based icons) |
| **ESLint** | 9.x | Code linting & quality checks |
| **@vitejs/plugin-react** | 4.3.x | React Fast Refresh for Vite |

**Key Frontend Characteristics:**
- **SPA (Single Page Application)**: Client-side routing, no page reloads
- **Polling Architecture**: Client polls server for updates (5s for agents, 2s for jobs)
- **Component-Based**: Modular, reusable UI components
- **Styling**: TailwindCSS utility classes + custom CSS for animations

### **Backend Stack**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | 4.19.2 | HTTP web server framework |
| **Node.js** | 18.x+ (inferred) | JavaScript runtime for server-side execution |
| **WS (WebSocket)** | 8.16.0 | WebSocket library for real-time bidirectional communication |
| **UUID** | 9.0.1 | Generates unique identifiers for jobs & agents |
| **CORS** | 2.8.5 | Middleware for cross-origin request handling |
| **Multer** | 1.4.4 | Middleware for handling file uploads |
| **Nodemon** | 3.1.11 | Development-only: auto-reloads on file changes |

**Key Backend Characteristics:**
- **RESTful API**: Standard HTTP methods (GET, POST) for resource operations
- **WebSocket-Driven**: Real-time push communication for agent updates
- **In-Memory Storage**: All state kept in JavaScript objects (no database)
- **Event-Driven Architecture**: Message-based communication between server and agents

### **Agent Stack**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18.x+ (inferred) | Execution runtime |
| **WS (WebSocket)** | 8.16.0 | Client-side WebSocket connection |
| **Docker** | 20.x+ (assumed) | Container runtime for executing jobs |
| **nvidia-smi** | CUDA Toolkit | Command-line GPU monitoring tool |
| **child_process** | Built-in Node.js | Spawns Docker & nvidia-smi commands |
| **fs** | Built-in Node.js | File system operations |
| **os** | Built-in Node.js | OS-level information (hostname, CPU cores, memory) |

**Key Agent Characteristics:**
- **Containerized Execution**: Jobs run inside isolated Docker containers
- **GPU Monitoring**: Real-time GPU stats via nvidia-smi parsing
- **Async Job Processing**: Non-blocking command execution
- **Currently Mostly Stubbed**: Implementation comments indicate intended but not fully implemented functionality

---

## Components Overview

### 1. **Frontend Application** (`frontend/`)

#### Main Entry Points

**[frontend/index.html](frontend/index.html)**
- Static HTML entry point
- Contains `<div id="root"></div>` mounting point for React

**[frontend/src/main.jsx](frontend/src/main.jsx)**
- Application bootstrap
- Mounts React app to DOM
- Loads global CSS

**[frontend/src/App.jsx](frontend/src/App.jsx)**
- Root component
- Routes and state management
- Authentication context

#### Page Components

1. **[AuthPage.jsx](frontend/src/components/AuthPage.jsx)**
   ```
   User Input
      ↓
   Form Validation (userId + password)
      ↓
   Store userId in application state
      ↓
   Navigate to Home
   ```
   - Simple form-based authentication
   - Client-side only (no backend validation yet)
   - Handles signup and login

2. **[HomePage.jsx](frontend/src/components/HomePage.jsx)**
   ```
   Marketing/Landing Page:
   ├─ Hero Section (headline, CTA buttons)
   ├─ Features Section (4 feature cards)
   ├─ Testimonials Section
   ├─ Stats Dashboard
   └─ Footer with CTAs
   ```
   - Marketing-focused landing page
   - Educates users about platform capabilities
   - Entry point to dashboard

3. **[GPUListPage.jsx](frontend/src/components/GPUListPage.jsx)**
   ```
   Every 5 seconds:
      ↓
   GET /api/agents
      ↓
   Parse response (agent list + GPU metrics)
      ↓
   Display in grid:
   ├─ Aggregate metrics (total GPUs, avg utilization, total memory)
   ├─ Individual agent cards
   └─ Per-GPU stats (memory, utilization, temperature, model)
   ```
   - Real-time GPU metrics dashboard
   - Polling-based refresh (5-second interval)
   - Fallback demo data if no agents connected
   - Metrics displayed: GPU memory, utilization %, temperature, model

4. **[DashboardPage.jsx](frontend/src/components/DashboardPage.jsx)**
   ```
   User enters Dockerfile code
      ↓
   Click Submit
      ↓
   POST /api/jobs {dockerfile}
      ↓
   Server returns {jobId, agentId}
      ↓
   Every 2 seconds: GET /api/jobs/:id
      ↓
   Display job details:
   ├─ Status (running/success/failure)
   ├─ Live logs output
   └─ Download button
   ```
   - Job submission editor
   - Dockerfile input with syntax highlighting
   - Real-time job status polling
   - Log viewer with download capability

#### Layout & Navigation

**[MainLayout.jsx](frontend/src/components/MainLayout.jsx)**
- Shell component wrapping all pages
- Sidebar navigation (Home | GPU Lists | Agents)
- Top navbar with logo, user info, logout
- Green accent color (#76B900)

#### Styling

**Global Styles**
- [frontend/src/index.css](frontend/src/index.css) - Global CSS resets & variables
- [frontend/src/App.css](frontend/src/App.css) - App-level styles

**Component Styles**
- [frontend/src/components/GridEffect.css](frontend/src/components/GridEffect.css) - Animated grid background
- [frontend/src/styles/LoadingAnimation.css](frontend/src/styles/LoadingAnimation.css) - Spinner animations
- [frontend/src/styles/CompactAnimation.css](frontend/src/styles/CompactAnimation.css) - Compact UI animations
- Primarily **TailwindCSS** utility classes (responsive design, spacing, colors)

#### Build Configuration

**[frontend/vite.config.js](frontend/vite.config.js)**
```javascript
export default {
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': { ... }
    }
  }
}
```
- Configures Vite dev server
- Proxies API calls to Express backend
- Hot module replacement (HMR) for React

---

### 2. **Backend Server** (`server/`)

#### Main Server File

**[server/server.js](server/server.js)**
```javascript
// Initializes:
// - Express HTTP server on port 8080
// - WebSocket server at /ws path
// - CORS middleware for cross-origin requests
// - Global state objects: agents{}, jobs{}
```

**Key Responsibilities:**
- HTTP server initialization
- WebSocket connection management
- Request routing to API handlers
- State management (agents & jobs registries)
- Heartbeat monitoring (ping/pong)

#### REST API Routes

**[server/routes/agents.js](server/routes/agents.js)**

```
Endpoint: GET /api/agents
Response: {
  agents: [
    {
      agentId: "hostname-xyz",
      status: "idle" | "busy",
      lastSeen: timestamp,
      gpus: [
        {
          name: "NVIDIA A100",
          memTotal: 40960,
          memUsed: 20480,
          util: 45,
          temp: 52,
          ...
        }
      ],
      system: {
        cpuCores: 32,
        totalMemoryMB: 262144,
        ...
      }
    }
  ]
}
```

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| GET | `/api/agents` | List all connected agents with GPU metrics | None | `{agents: Agent[]}` |
| GET | `/api/agents/:id` | Get specific agent details | None | `{agent: Agent}` |

**[server/routes/jobs.js](server/routes/jobs.js)**

```
Endpoint: POST /api/jobs
Request: { dockerfile: "FROM nvidia/cuda:12.0\nRUN echo 'test'" }
Process:
  1. Validate dockerfile is not empty
  2. pickIdleAgent() from scheduler
  3. Generate jobId (UUID)
  4. Create job record in jobs{}
  5. Send "runJob" message to agent's WebSocket
  6. Return jobId to client

Response: { jobId, agentId }
```

```
Endpoint: GET /api/jobs/:id
Response: {
  jobId: "uuid-xxx",
  agentId: "hostname-yyy",
  status: "running" | "success" | "failure",
  logs: "Docker output and logs...",
  createdAt: timestamp,
  finishedAt: timestamp (if complete)
}
```

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/api/jobs` | Submit new job | `{dockerfile}` | `{jobId, agentId}` |
| GET | `/api/jobs/:id` | Get job status & logs | None | `{jobId, agentId, status, logs, ...}` |

#### State Management

**[server/state/agents.js](server/state/agents.js)**

```javascript
// Agent object structure:
agents = {
  "agent-001": {
    ws: WebSocket,              // Active connection
    status: "idle" | "busy",    // Current availability
    gpus: [...],                // GPU array (from nvidia-smi)
    system: {...},              // OS metrics
    lastSeen: 1234567890        // Timestamp of last message
  }
}
```

**Agent Lifecycle:**
```
1. Agent connects via WebSocket
2. Server receives "hello" message with agentId
3. agents[agentId] created, status = "idle"
4. Agent sends periodic "stats" messages
5. Server updates agents[agentId] properties
6. Job assigned → status = "busy"
7. Job completed → status = "idle"
8. Agent disconnects → agents[agentId] removed
```

**[server/state/jobs.js](server/state/jobs.js)**

```javascript
// Job object structure:
jobs = {
  "job-uuid-001": {
    jobId: "job-uuid-001",
    agentId: "agent-001",
    status: "running" | "success" | "failure",
    logs: "Docker container output...",
    createdAt: timestamp,
    finishedAt: timestamp,
    dockerfile: "FROM nvidia/cuda..."
  }
}
```

**Job Lifecycle:**
```
1. POST /api/jobs {dockerfile}
2. Job created with status = "running"
3. Agent executes Docker container
4. Agent sends "jobResult" message
5. Server updates job with status & logs
6. Frontend polls and displays results
7. Job marked complete
```

#### Job Scheduler

**[server/scheduler/scheduler.js](server/scheduler/scheduler.js)**

```javascript
function pickIdleAgent() {
  return Object.values(agents).find(agent => agent.status === "idle");
}
```

**Current Algorithm:**
- **Simple Selection**: Returns first agent found with `status === "idle"`
- **No Load Balancing**: Doesn't consider GPU utilization or memory
- **No Prioritization**: FIFO without job priority queues

**Limitations:**
- Not optimal for multi-GPU assignment
- Single-threaded, synchronous selection
- No fairness or round-robin distribution

#### Utilities

**[server/utils/logger.js](server/utils/logger.js)**

```javascript
logger.info("Message")    // Console with timestamp
logger.error("Error msg") // Same with ERROR prefix
logger.warn("Warning")    // Same with WARN prefix
```

#### WebSocket Event Handlers

**Core Message Types:**

1. **Agent → Server: "hello"**
   ```javascript
   { type: "hello", agentId: "hostname-001" }
   → Server registers agent, sets status = "idle"
   ```

2. **Agent → Server: "stats"**
   ```javascript
   {
     type: "stats",
     agentId: "hostname-001",
     status: "idle" | "busy",
     gpus: [{name, memTotal, memUsed, util, temp}],
     system: {cpuCores, totalMemoryMB}
   }
   → Server updates agents[agentId] with metrics
   ```

3. **Server → Agent: "runJob"**
   ```javascript
   { type: "runJob", jobId: "uuid", dockerfile: "FROM..." }
   ← Agent receives and executes in Docker
   ```

4. **Agent → Server: "jobResult"**
   ```javascript
   { type: "jobResult", jobId: "uuid", status: "success|failure", logs: "output" }
   → Server stores results in jobs[jobId]
   ```

5. **Bidirectional: "ping" / "pong"**
   ```javascript
   Server → Agent: { type: "ping" }
   Agent → Server: { type: "pong" }
   → Health check, connection validation
   ```

---

### 3. **Agent Service** (`agent/`)

#### Current Status: **Mostly Stubbed (Commented Out)**

**[agent/agent.js](agent/agent.js)** — Commented implementation shows intended behavior:

```javascript
// const ws = new WebSocket('ws://172.20.10.2:8080/ws');
//
// ws.on('open', () => {
//   ws.send(JSON.stringify({
//     type: 'hello',
//     agentId: os.hostname()
//   }));
//   
//   // Send stats every 10 seconds
//   setInterval(() => {
//     execSync('nvidia-smi').toString() // Parse GPU info
//     ws.send(stats);
//   }, 10000);
// });
//
// ws.on('message', (data) => {
//   const msg = JSON.parse(data);
//   if (msg.type === 'runJob') {
//     // Execute Docker: docker run -it dockerfile...
//     // Collect logs
//     // Send jobResult back
//   }
// });
```

#### Intended Functionality

**Connection Phase:**
```
1. Connect to server: ws://172.20.10.2:8080/ws
2. Send "hello" with agentId (hostname)
3. Server registers agent
4. Begin periodic stats reporting (10-second interval)
```

**Stats Reporting:**
```
Every 10 seconds:
  ├─ Run: nvidia-smi (parse GPU details)
  ├─ Read: /proc/cpuinfo (CPU cores)
  ├─ Read: /proc/meminfo (system memory)
  ├─ Check current job status
  └─ Send "stats" message to server
```

**Job Execution:**
```
Receive "runJob" message:
  1. Extract dockerfile from message
  2. Create temp file with dockerfile
  3. Run: docker build -t temp:latest .
  4. Run: docker run temp:latest
  5. Capture stdout/stderr logs
  6. Send "jobResult" with logs to server
  7. Set status = "idle" for next job
```

**Key Components (Intended):**
- **WebSocket Client**: Persistent connection to server
- **GPU Monitoring**: nvidia-smi command execution & parsing
- **Docker Integration**: Container build and execution
- **Log Capture**: Async output collection
- **Error Handling**: Job failure recovery

#### Docker Dockerfile

**[agent/Dockerfile](agent/Dockerfile)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY agent.js .
CMD ["node", "agent.js"]
```

- Creates containerized agent environment
- Based on lightweight Alpine Linux
- Installs Node.js dependencies
- Assumes agent.js will be uncommented & finished

---

## Data Models

### Agent Data Model

```javascript
Agent = {
  // Identity
  agentId: String,                    // Hostname or unique identifier
  
  // Connection & Status
  ws: WebSocket,                      // Active WebSocket connection
  status: "idle" | "busy",            // Current availability status
  lastSeen: Number,                   // Timestamp of last heartbeat
  
  // Hardware Metrics
  gpus: [
    {
      name: String,                   // "NVIDIA A100"
      memTotal: Number,               // MB
      memUsed: Number,                // MB
      util: Number,                   // 0-100 percentage
      temp: Number,                   // Celsius
      uuid: String,                   // Hardware UUID
      computeCap: String,             // "8.0" for A100
      driverVersion: String,          // CUDA driver version
      ...                             // Additional nvidia-smi fields
    }
  ],
  
  // System Metrics
  system: {
    cpuCores: Number,                 // Logical cores
    cpuModel: String,                 // CPU name
    totalMemoryMB: Number,            // System RAM in MB
    osType: String,                   // "Linux", "Windows", etc.
    ...                               // Additional OS info
  }
}
```

### Job Data Model

```javascript
Job = {
  // Identification
  jobId: String,                      // UUID v4
  agentId: String,                    // Assigned agent ID
  
  // Specification
  dockerfile: String,                 // Full Dockerfile content
  
  // Status & Results
  status: "running" | "success" | "failure",
  logs: String,                       // Complete stdout/stderr output
  
  // Timing
  createdAt: Number,                  // Unix timestamp submission
  finishedAt: Number,                 // Unix timestamp completion
  
  // Error Info (if needed)
  errorMessage: String,               // Failure reason (optional)
  exitCode: Number                    // Docker exit code (optional)
}
```

### User Data Model (Planned)

```javascript
User = {
  userId: String,                     // Username or email
  password: String,                   // Hash (backend needed)
  authToken: String,                  // Session/JWT (backend needed)
  email: String,
  createdAt: Number,
  
  // Quotas
  maxConcurrentJobs: Number,
  maxMonthlyGPUHours: Number,
  monthlyGPUHoursUsed: Number
}
```

---

## API Reference

### Authentication Endpoints (Client-Only, Not Implemented)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/auth/signup` | Create new user account | ❌ Not implemented |
| POST | `/api/auth/login` | Authenticate user | ❌ Not implemented |
| POST | `/api/auth/logout` | End session | ❌ Not implemented |
| GET | `/api/auth/profile` | Get user info | ❌ Not implemented |

### Agent Endpoints

| Method | Endpoint | Purpose | Request | Response | Status |
|--------|----------|---------|---------|----------|--------|
| GET | `/api/agents` | List all agents & GPU metrics | — | `{agents: Agent[]}` | ✅ Implemented |
| GET | `/api/agents/:id` | Get specific agent | — | `{agent: Agent}` | ⚠️ Partial |
| POST | `/api/agents/:id/restart` | Restart agent | — | `{success: boolean}` | ❌ Not implemented |

### Job Endpoints

| Method | Endpoint | Purpose | Request | Response | Status |
|--------|----------|---------|---------|----------|--------|
| POST | `/api/jobs` | Submit new job | `{dockerfile}` | `{jobId, agentId}` | ✅ Implemented |
| GET | `/api/jobs/:id` | Get job status & logs | — | `{jobId, status, logs, ...}` | ✅ Implemented |
| DELETE | `/api/jobs/:id` | Cancel running job | — | `{success: boolean}` | ❌ Not implemented |
| GET | `/api/jobs` | List all jobs (history) | — | `{jobs: Job[]}` | ❌ Not implemented |

### WebSocket Endpoints

**Base URL**: `ws://172.20.10.2:8080/ws` (or `ws://localhost:8080/ws` for local)

**Handshake Upgrade**:
```
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
```

### WebSocket Message Protocol

#### Client → Server Messages

**1. Agent Registration**
```json
{
  "type": "hello",
  "agentId": "gpu-server-01"
}
```

**2. Metrics Update**
```json
{
  "type": "stats",
  "agentId": "gpu-server-01",
  "status": "idle",
  "gpus": [
    {
      "name": "NVIDIA A100",
      "memTotal": 40960,
      "memUsed": 20480,
      "util": 45,
      "temp": 52
    }
  ],
  "system": {
    "cpuCores": 32,
    "totalMemoryMB": 262144
  }
}
```

**3. Job Completion**
```json
{
  "type": "jobResult",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "logs": "[TIMESTAMP] Step 1/5 : FROM nvidia/cuda:12.0\n...\nSuccessfully built image"
}
```

**4. Heartbeat Response**
```json
{
  "type": "pong"
}
```

#### Server → Client Messages

**1. Job Assignment**
```json
{
  "type": "runJob",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "dockerfile": "FROM nvidia/cuda:12.0\nRUN pip install torch\n..."
}
```

**2. Health Check**
```json
{
  "type": "ping"
}
```

---

## Communication Protocols

### HTTP/REST (Client ↔ Server)

**Protocol**: HTTP/1.1
**Port**: 8080
**Base URL**: `http://172.20.10.2:8080` (or `http://localhost:8080` for dev)

**Characteristics:**
- Request-response model
- Polling-based for real-time updates
- REST conventions (GET, POST, PUT, DELETE)
- JSON content type
- CORS-enabled for cross-origin frontend requests

**Polling Intervals:**
- GPU metrics: 5 seconds (`GPUListPage` refresh rate)
- Job status: 2 seconds (`DashboardPage` refresh rate)

### WebSocket (Server ↔ Agent)

**Protocol**: WebSocket (RFC 6455)
**Endpoint**: `/ws` (path on same HTTP server)
**Port**: 8080 (upgrades HTTP connection)

**Characteristics:**
- Persistent bidirectional connection
- Event-driven message passing
- Text frames (JSON-serialized messages)
- Full-duplex communication
- Connection pooling (one per agent)

**Message Flow:**
```
Agent               Server              Client
 │ "hello"           │                    │
 ├──────────────────→│                    │
 │                   │ Store in agents{}  │
 │                   │ Set idle status    │
 │                   │                    │
 │                  ↓ (every 5s)          │
 │                   │ GET /api/agents ←──┤
 │                   │                    │
 │ "stats"           │                    │
 ├──────────────────→│                    │
 │                   │ Update metrics     │
 │                   │                    │
 │                   │                    │ POST /api/jobs
 │                   │ Create job entry ──→
 │                   │                    │
 │ "runJob"          │                    │
 ←──────────────────┤                    │
 │ (execute Docker)  │                    │
 │                   │                    │
 │ "jobResult"       │                    │
 ├──────────────────→│                    │
 │                   │ GET /api/jobs/:id ←──
 │                   │ Return logs        │
```

---

## Data Flows & Workflows

### Workflow 1: Agent Initialization & Setup

```
Agent Process Started
    ↓
Connect WebSocket to server
    ↓
Send "hello" {agentId: hostname}
    ↓
Server receives, creates agents[agentId]
    ↓
Set agent.status = "idle"
    ↓
Agent starts periodic stats loop (every 10s)
    ↓
Each cycle:
  ├─ nvidia-smi (parse GPU data)
  ├─ Get system metrics
  ├─ Determine current status
  └─ Send "stats" message
    ↓
Server updates agents[agentId] with fresh metrics
    ↓
[READY FOR JOB ASSIGNMENT]
```

**Metrics Available:**
- Per-GPU: name, memory, utilization, temperature, driver version
- System: CPU cores, total memory, OS type
- Timing: lastSeen timestamp

---

### Workflow 2: Job Submission & Execution

**Phase 1: Submission**
```
User enters Dockerfile in browser
    ↓
Click "Submit Job"
    ↓
Frontend: POST /api/jobs
  {
    dockerfile: "FROM nvidia/cuda:12.0\n..."
  }
    ↓
Server Handler:
  1. Validate dockerfile isn't empty
  2. pickIdleAgent() from scheduler
  3. Generate jobId (UUID)
  4. Create jobs[jobId] = {
       jobId, agentId, status: "running",
       dockerfile, logs: "", createdAt: now
     }
  5. Set agent.status = "busy"
  6. Send WebSocket "runJob" message to agent
  7. Return HTTP 200
    ↓
Frontend receives jobId
    ↓
[BEGIN POLLING PHASE 2]
```

**Phase 2: Execution**
```
Agent receives "runJob" message
    ↓
Parse jobId & dockerfile
    ↓
Execute Docker:
  docker build -f Dockerfile -t temp:latest .
  docker run --rm temp:latest
    ↓
Capture stdout/stderr in real-time
    ↓
Docker container exits with status code
    ↓
Collect all accumulated logs
    ↓
Send WebSocket "jobResult" message:
  {
    jobId: "uuid",
    status: "success" (exitCode=0) | "failure",
    logs: "full output"
  }
    ↓
[ASYNC — Parallel with Phase 3]
```

**Phase 3: Polling & Display**
```
Frontend: Every 2 seconds
    ↓
GET /api/jobs/:jobId
    ↓
Server responds with:
  {
    jobId, agentId, status, logs,
    createdAt, finishedAt (if complete)
  }
    ↓
Frontend:
  ├─ If status = "running"
  │   └─ Show spinner, partial logs
  ├─ If status = "success" or "failure"
  │   └─ Show complete logs, enable download
  └─ Hide polling if complete
```

**Phase 4: Completion**
```
Server receives "jobResult" from agent
    ↓
Update jobs[jobId]:
  {
    status: "success" or "failure",
    logs: "complete output",
    finishedAt: now
  }
    ↓
Set agent.status = "idle"
    ↓
[READY FOR NEXT JOB]
    ↓
Frontend polls (every 2s) and displays results
    ↓
User downloads logs or submits new job
```

---

### Workflow 3: Real-Time Metrics Monitoring

```
Frontend: GPUListPage component mounted
    ↓
Every 5 seconds:
    ↓
GET /api/agents
    ↓
Server returns:
  {
    agents: [
      {
        agentId, status,
        gpus: [{name, memTotal, memUsed, util, temp}],
        system: {cpuCores, totalMemoryMB}
      },
      ...
    ]
  }
    ↓
Frontend calculates aggregates:
  ├─ Total GPU count: sum all gpus[] lengths
  ├─ Average utilization: mean of util values
  ├─ Total memory: sum all memTotal
  └─ Used memory: sum all memUsed
    ↓
Render:
  ┌─────────────────────────────────────┐
  │ Total GPUs: 8                       │
  │ Avg Utilization: 42.5%              │
  │ Total Memory: 327 GB                │
  └─────────────────────────────────────┘
  
  [Agent 1] [Agent 2] ... [Agent N]
    
    Each agent card:
    ├─ Status badge (idle/busy)
    ├─ GPU list with bars
    └─ Metrics
    ↓
Wait 5 seconds
    ↓
[REPEAT]
```

---

## Key Terms Glossary

### **Infrastructure & Deployment**

| Term | Definition | Example |
|------|-----------|---------|
| **Agent** | A node running GPU hardware that connects to the server and executes jobs | `gpu-server-01` with 4 NVIDIA A100 GPUs |
| **GPU** | Graphics Processing Unit; accelerated compute hardware | NVIDIA A100, V100, H100 |
| **nvidia-smi** | NVIDIA System Management Interface; CLI tool for GPU monitoring | `nvidia-smi --query-gpu=name,memory.total` |
| **Docker** | Container platform for packaging applications with dependencies | `docker run -it my-app:latest` |
| **Dockerfile** | Text file specifying container image build steps | `FROM nvidia/cuda:12.0\nRUN pip install torch` |
| **Pod** | One containerized instance of a job (Kubernetes term, not used here yet) | — |

### **Network & Communication**

| Term | Definition | Example |
|------|-----------|---------|
| **WebSocket** | Protocol enabling persistent bidirectional communication over TCP | Long-lived connection between agent and server |
| **REST API** | Architectural style using HTTP methods for resource operations | `GET /api/agents`, `POST /api/jobs` |
| **HTTP** | Hypertext Transfer Protocol; client-server request-response | Stateless, request = response |
| **CORS** | Cross-Origin Resource Sharing; allows cross-domain requests | Frontend on `localhost:5173` accessing API on `localhost:8080` |
| **Polling** | Client periodically queries server for updates | Frontend checks job status every 2 seconds |
| **Push** | Server initiates message to client without request | Server sends `ping` to agent; agent responds `pong` |

### **Frontend Architecture**

| Term | Definition | Example |
|------|-----------|---------|
| **SPA** | Single Page Application; client-side routing, no page reloads | React app handles navigation without server |
| **Component** | Reusable UI building block in React | `<GPUListPage />` |
| **State** | JavaScript object tracking component data | `[users, setUsers] = useState([])` |
| **Props** | Parameters passed to React components | `<Card title={agentId} />` |
| **Hook** | React function for managing state/effects | `useState()`, `useEffect()` |
| **Vite** | Ultra-fast build tool and dev server | Serves frontend during development |
| **TailwindCSS** | Utility-first CSS framework; compose styles from utilities | `<div className="bg-green-500 rounded p-4">` |

### **Backend & Data**

| Term | Definition | Example |
|------|-----------|---------|
| **Route** | URL endpoint handling specific requests | `GET /api/agents` is a route |
| **Handler** | Function processing a request and returning response | Function for `POST /api/jobs` |
| **Middleware** | Function in pipeline between request and handler | CORS, authentication, logging |
| **Event** | Message indicating something significant happened | Agent sends `stats` event |
| **State Store** | In-memory database of objects | JavaScript object `agents = {}` |
| **UUID** | Universally Unique Identifier; 36-character ID | `550e8400-e29b-41d4-a716-446655440000` |
| **Scheduler** | Logic deciding which agent gets a job | `pickIdleAgent()` finds first idle agent |
| **Heartbeat** | Periodic signal to verify connection health | `ping`/`pong` messages |

### **Job & Execution**

| Term | Definition | Example |
|------|-----------|---------|
| **Job** | Unit of work submitted by user (Dockerfile to execute) | Docker container building and running |
| **Job Status** | Current state of execution | `running`, `success`, `failure` |
| **Log** | Text output from job execution (stdout + stderr) | `[TIMESTAMP] Step 1/5 : FROM nvidia/cuda:12.0` |
| **Exit Code** | Numeric status from completed process (0 = success, non-0 = error) | Docker returns exit code 0 on success |
| **Load Balancing** | Distributing work across multiple agents | Round-robin or weighted distribution |
| **Queue** | List of pending jobs awaiting execution | Jobs waiting for idle agent |
| **Timeout** | Maximum time allowed for job completion | Job times out after 30 minutes |

### **Technologies & Frameworks**

| Term | Definition | Example |
|------|-----------|---------|
| **React** | JavaScript library for building UIs with components | `function HomePage() { return <div>...</div> }` |
| **Express.js** | Minimal web framework for Node.js | `app.get('/api/agents', handler)` |
| **WebSocket (WS)** | Node.js library implementing WebSocket protocol | `new WebSocket('ws://localhost:8080/ws')` |
| **Node.js** | JavaScript runtime for server-side execution | Runs Express server and agents |
| **npm** | Node Package Manager; installs JavaScript dependencies | `npm install express` |
| **Nodemon** | Development tool auto-reloading on file changes | Watches server files during dev |
| **child_process** | Node.js module spawning subprocesses | `execSync('nvidia-smi')` |
| **fs** | File system access module (Node.js built-in) | Read/write job logs |

### **Monitoring & Observability**

| Term | Definition | Example |
|------|-----------|---------|
| **Metrics** | Quantitative measurements of system performance | GPU memory (GB), utilization (%), temperature (°C) |
| **Dashboard** | Visual display of system metrics | GPU metrics page showing all agent stats |
| **Status Badge** | Visual indicator of current state | "idle" (green) vs "busy" (red) |
| **Memory Utilization** | Percentage of GPU memory in use | If memUsed=20GB, memTotal=40GB → 50% |
| **Thermal Throttling** | Performance reduction due to high temperature | GPU reduces clock speed if temp > 85°C |

---

## Current Implementation Status

### ✅ Fully Implemented

- **Frontend UI Components**: All pages, navigation, styling
- **REST API**: Agent listing, job submission, job status
- **WebSocket Infrastructure**: Connection handling, message routing
- **In-Memory State**: Agent and job registries
- **Basic Scheduler**: Simple idle agent selection
- **Polling Mechanisms**: Client-side polling (5s agents, 2s jobs)
- **Frontend-Only Authentication**: UI for login/signup (no backend validation)

### ⚠️ Partially Implemented

- **Agent Service**: Stubbed with comments; no active implementation
- **Docker Integration**: Expected but not functional
- **GPU Monitoring**: Interface defined; nvidia-smi parsing not active
- **Job Logging**: Structure in place; Docker output capture pending
- **Error Handling**: Basic; missing comprehensive error states

### ❌ Not Implemented

- **Backend Authentication**: No user table, token generation, session management
- **Database Persistence**: All state lost on server restart
- **Advanced Scheduling**: No load balancing, priority queues, or fairness
- **Job Queuing**: No queue for jobs when all agents busy (fails immediately)
- **Rate Limiting**: No throttling on API or WebSocket messages
- **Monitoring Dashboard**: No server-side metrics (CPU, memory, request counts)
- **Logging System**: No persistent logs or audit trail
- **Health Checks**: No agent liveness probes or automatic reconnection
- **Job Cancellation**: No ability to stop running jobs
- **Resource Quotas**: No GPU hour limits or user restrictions
- **Multi-Tenancy**: Single shared pool; no isolation between users
- **TLS/SSL**: No encryption on WebSocket or HTTP
- **Testing**: No unit tests or integration tests

### 🎯 Next Steps for Production

1. **Uncomment & Complete Agent Service** (`agent/agent.js`)
   - Integrate nvidia-smi parsing
   - Implement Docker execution
   - Add error recovery & reconnection

2. **Add Database** (PostgreSQL or MongoDB)
   - Persist agents, jobs, users
   - Enable job history & analytics

3. **Implement Backend Authentication**
   - User registration & login
   - JWT token generation
   - Session validation middleware

4. **Upgrade Scheduler**
   - Implement placement constraints (GPU requirements)
   - Add load balancing & fairness
   - Implement job queuing

5. **Add Monitoring & Observability**
   - Prometheus metrics export
   - Structured logging (Winston/Pino)
   - APM integration (DataDog/New Relic)

6. **Harden Security**
   - Input validation on all endpoints
   - TLS/SSL certificates
   - Rate limiting, CORS refinement
   - Dockerfile validation (prevent malicious images)

7. **Production Containerization**
   - Dockerfile for backend server
   - Reusable agent container template
   - Docker Compose or Kubernetes manifests

---

## Architecture Summary

This **GPU Rental System** represents a modern distributed platform designed for democratizing access to high-performance GPU computing. The three-tier architecture (Frontend → Backend Server → GPU Agents) provides:

- **Scalability**: Multiple agents can connect and distribute workload
- **Simplicity**: User-friendly web interface for job submission
- **Real-Time Visibility**: Live metrics dashboard and status polling
- **Containerization**: Docker jobs for reproducibility and isolation
- **Extensibility**: Well-defined message protocol ready for additional features

The codebase is in an **MVP-to-Beta phase**, with core communication and UI complete, awaiting agent service completion and database integration for production deployment.

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-26  
**Scope**: Complete technical architecture & feature reference
