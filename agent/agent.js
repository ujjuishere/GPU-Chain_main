// // work of agent 
// // create a socket connection 
// // give gpu information

// const WebSocket = require('ws');
// const os = require('os');
// const { spawn , exec  , execSync} = require('child_process');

// // file system
// const fs = require('fs');
// const path = require('path');

// const SERVER = process.env.SERVER_URL || "ws://172.20.10.2:8080/ws";

// const AGENT_ID = os.hostname();


// // job directory 
// const JOBS_DIR = path.join(__dirname, 'jobs');

// function ensureJobsDir() {
//     if (!fs.existsSync(JOBS_DIR)) {
//         fs.mkdirSync(JOBS_DIR);
//     }
// }

// function safeWriteFile(filePath, data) {
//     try{
//         ensureJobsDir(path.dirname(filePath));
//         fs.writeFileSync(filePath, data);
//     } catch(err){
//         console.error("Error writing file:", err);
//     }
// }

// function safeRemoveDir(dirPath) {
//     try{
//         if (fs.existsSync(dirPath)) {
//             fs.rmSync(dirPath, { recursive: true, force: true });
//         }
//     }catch(err){
//         console.error("Error removing directory:", err);
//     }
// }





// console.log("Connecting to server:", SERVER);
// console.log("Agent ID:", AGENT_ID);

// let ws;
// let status = "idle"; // idle, busy

// function getGPUInfo() {
//     try {
//         const out = execSync('nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,utilization.memory --format=csv,noheader,nounits').toString();
//         console.log("GPU Info:", out);
//         const gpus = out.trim().split('\n').map(line => {
//             const [name, memTotal, memUsed, memFree, util , temp , utilization ] = line.split(', ').map(item => item.trim());
//             return { name, memTotal: parseInt(memTotal), memUsed: parseInt(memUsed), memFree: parseInt(memFree), util: parseInt(util) , temp: parseInt(temp) , utilization: parseInt(utilization) };
//         });
//         return gpus;

//     } catch (error) {
//         console.error("Error getting GPU info:", error);
//         return [];
//     }
// }


// function sendStats(){

//     console.log("Preparing to send stats... Entered sendStats function");

//     if(ws && ws.readyState === WebSocket.OPEN){

//         console.log("Sending stats to server...");
//         //
//         // gpu : {
//         //     name : "" ,
//         //     memTotal : 0 ,
//         //     memUsed : 0 ,
//         //     memFree : 0 ,
//         //     util : 0
//         // }
//         //
//         ws.send(JSON.stringify({
//             type: "stats",
//             agentId: AGENT_ID,
//             status: status,
//             gpus: getGPUInfo() ,
//             system : {
//                 platform : os.platform(),
//                 cpuCores : os.cpus().length,
//                 cpuModel : os.cpus()[0].model,
//                 totalMemoryMB : Math.round(os.totalmem() / (1024 * 1024)),
//                 freeMemoryMB : Math.round(os.freemem() / (1024 * 1024))
//             }
//         }))

//     }
//     else {
//         console.log("WebSocket not connected. Cannot send stats.");
//         return;
//     }
// }


// function runJob(jobId , dockerfileContent) {
//     console.log(" inside runJob function ");
//     if(status === "busy"){
//         console.log("Agent is busy. Cannot run new job.");
//         return;
//     }
//     if(!jobId || !dockerfileContent){
//         if(!jobId){
//             console.log("Invalid jobId. Cannot run job.");
//         }
//         if(!dockerfileContent){
//             console.log("Invalid dockerfileContent. Cannot run job.");
//         }
//         return;
//     }

//     status = "busy";
//     sendStats();

//     const jobDir = path.join(JOBS_DIR, jobId);
//     ensureJobsDir(jobDir);
//     safeWriteFile(path.join(jobDir, 'Dockerfile'), dockerfileContent);

//     const imageTag = `agent_job_${jobId}`;

//     console.log("Building Docker image...");

//     const buildProcess = spawn('docker', ['build', '-t', imageTag, jobDir]);

//     let buildLogs = '';

//     buildProcess.stdout.on('data', data => {
//             buildLogs += data.toString();
//         }
//     );

//     buildProcess.stderr.on('data', data => {
//             buildLogs += data.toString();
//         }
//     );
    
//     buildProcess.on('close', code => {
//         if(code === 0){
//             console.log("Docker image built successfully. Running container...");
//             const runProcess = spawn('docker', ['run', '--rm', imageTag]);

//             let runLogs = '';
//             runProcess.stdout.on('data', data => {
//                 runLogs += data.toString();
//             }
//             );
//             runProcess.stderr.on('data', data => {
//                 runLogs += data.toString();
//             }
//             );
//             runProcess.on('close', runCode => {
//                 const success = runCode === 0;
//                 const allLogs = `--- Build Logs ---\n${buildLogs}\n--- Run Logs ---\n${runLogs}`;
//                 console.log("Container run completed. Sending result...");
//                 sendResult(jobId, success, allLogs);
//                 safeRemoveDir(jobDir);
//                 status = "idle";
//                 sendStats();
//             }
//             );
//         } else {
//             console.log("Docker image build failed. Sending result...");
//             const allLogs = `--- Build Logs ---\n${buildLogs}`;
//             sendResult(jobId, false, allLogs);
//             safeRemoveDir(jobDir);
//             status = "idle";
//             sendStats();
//         }
//     }
//     );
// }



// function sendResult(jobId, success, logs) {
//     console.log("Preparing to send job result... inside sendResult function");
//     if(ws && ws.readyState === WebSocket.OPEN){
//         console.log("Sending job result to server...");

//         ws.send(JSON.stringify({
//             type: "jobResult",
//             agentId: AGENT_ID,
//             jobId: jobId,
//             status: success ? "success" : "failure",
//             logs: logs
//         }))
//     }
//     else{
//         console.log("WebSocket not connected. Cannot send job result.");
//         return;
//     }
// }

// // run job 
// // recive a docker file 
// // build the docker image
// // run the docker container
// // send back the logs
// // change status accordingly




// function connect() {
//     ws = new WebSocket(SERVER);

//     console.log("Attempting to connect to server...  inside connect function");

//     ws.on('open' , () => {
//         console.log("Connected to server.");

       
//         ws.send(JSON.stringify({
//             type: "hello",
//             agentId: AGENT_ID
//         }))

//         sendStats();
//     });

//     ws.on('message' , msg => {
//         let data;
//         try{
//             data = JSON.parse(msg);
//         } catch(err){
//             console.error("Invalid message format:", err);
//             return;
//         }

//         if(data.type === "runJob" && data.jobId && data.dockerfile){
//             console.log("Received runJob command:", data.jobId);
//             runJob(data.jobId , data.dockerfile);
//         }
//         if(data.type === "ping"){
//             console.log("Received ping from server. Sending pong...");
//             ws.send(JSON.stringify({
//                 type: "pong",
//                 agentId: AGENT_ID
//             }))
//         }
//     });

//     ws.on('close' , () => {
//         console.log("Connection closed. Reconnecting in 5 seconds...");
//         setTimeout(connect , 5000);

//     })
// } 


// // At the bottom of the file, after the connect() function definition:

// connect();

// // Also send stats periodically
// setInterval(() => {
//     sendStats();
// }, 10000); // Every 10 seconds


const WebSocket = require('ws');
const os = require('os');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');




const SERVER = process.env.SERVER_URL || "wss://foldaway-illatively-julian.ngrok-free.dev/ws";
const AGENT_ID = os.hostname();
const JOBS_DIR = path.join(__dirname, 'jobs');

let ws;
let status = "idle";

// FIXED: Ensure directory creation is recursive
function ensureJobsDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function safeWriteFile(filePath, data) {
    try {
        ensureJobsDir(path.dirname(filePath));
        fs.writeFileSync(filePath, data);
        console.log("File written successfully:", filePath);
    } catch(err) {
        console.error("Error writing file:", err);
        throw err;
    }
}

function safeRemoveDir(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log("Directory removed:", dirPath);
        }
    } catch(err) {
        console.error("Error removing directory:", err);
    }
}

function getGPUInfo() {
    try {
        const out = execSync('nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu,utilization.memory --format=csv,noheader,nounits').toString();
        const gpus = out.trim().split('\n').map(line => {
            const [name, memTotal, memUsed, memFree, util, temp, utilization] = line.split(', ').map(item => item.trim());
            return {
                name,
                memTotal: parseInt(memTotal),
                memUsed: parseInt(memUsed),
                memFree: parseInt(memFree),
                util: parseInt(util),
                temp: parseInt(temp),
                utilization: parseInt(utilization)
            };
        });
        return gpus; // FIXED: Actually return the array
    } catch (error) {
        console.error("Error getting GPU info:", error.message);
        return [];
    }
}

function sendStats() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("Sending stats to server...");
        ws.send(JSON.stringify({
            type: "stats",
            agentId: AGENT_ID,
            status: status,
            gpus: getGPUInfo(),
            system: {
                platform: os.platform(),
                cpuCores: os.cpus().length,
                cpuModel: os.cpus()[0].model,
                totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
                freeMemoryMB: Math.round(os.freemem() / (1024 * 1024))
            }
        }));
    } else {
        console.log("WebSocket not connected. Cannot send stats.");
    }
}

function runJob(jobId, dockerfileContent) {
    console.log("Starting job:", jobId);
    
    if (status === "busy") {
        console.log("Agent is busy. Cannot run new job.");
        return;
    }
    
    if (!jobId || !dockerfileContent) {
        console.log("Invalid job parameters");
        return;
    }

    status = "busy";
    sendStats();

    const jobDir = path.join(JOBS_DIR, jobId);
    
    try {
        // Create job directory and write Dockerfile
        ensureJobsDir(jobDir);
        safeWriteFile(path.join(jobDir, 'Dockerfile'), dockerfileContent);
        
        const imageTag = `agent_job_${jobId}`;
        console.log("Building Docker image:", imageTag);

        const buildProcess = spawn('docker', ['build', '-t', imageTag, jobDir]);
        let buildLogs = '';

        buildProcess.stdout.on('data', data => {
            buildLogs += data.toString();
            console.log('BUILD:', data.toString());
        });

        buildProcess.stderr.on('data', data => {
            buildLogs += data.toString();
            console.log('BUILD ERR:', data.toString());
        });

        buildProcess.on('error', (err) => {
            console.error('Docker build spawn error:', err);
            const allLogs = `--- Build Error ---\n${err.message}\n${buildLogs}`;
            sendResult(jobId, false, allLogs);
            safeRemoveDir(jobDir);
            status = "idle";
            sendStats();
        });

        buildProcess.on('close', code => {
            if (code === 0) {
                console.log("Docker image built successfully. Running container...");
                const runProcess = spawn('docker', ['run', '--rm', imageTag]);

                let runLogs = '';
                
                runProcess.stdout.on('data', data => {
                    runLogs += data.toString();
                    console.log('RUN:', data.toString());
                });

                runProcess.stderr.on('data', data => {
                    runLogs += data.toString();
                    console.log('RUN ERR:', data.toString());
                });

                runProcess.on('error', (err) => {
                    console.error('Docker run spawn error:', err);
                    const allLogs = `--- Build Logs ---\n${buildLogs}\n--- Run Error ---\n${err.message}\n${runLogs}`;
                    sendResult(jobId, false, allLogs);
                    safeRemoveDir(jobDir);
                    status = "idle";
                    sendStats();
                });

                runProcess.on('close', runCode => {
                    const success = runCode === 0;
                    const allLogs = `--- Build Logs ---\n${buildLogs}\n--- Run Logs ---\n${runLogs}`;
                    console.log("Container run completed. Exit code:", runCode);
                    sendResult(jobId, success, allLogs);
                    safeRemoveDir(jobDir);
                    status = "idle";
                    sendStats();
                });
            } else {
                console.log("Docker image build failed. Exit code:", code);
                const allLogs = `--- Build Logs ---\n${buildLogs}`;
                sendResult(jobId, false, allLogs);
                safeRemoveDir(jobDir);
                status = "idle";
                sendStats();
            }
        });
    } catch (err) {
        console.error("Job execution error:", err);
        sendResult(jobId, false, `Error: ${err.message}`);
        safeRemoveDir(jobDir);
        status = "idle";
        sendStats();
    }
}

function sendResult(jobId, success, logs) {
    console.log("Sending job result for:", jobId, "Success:", success);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "jobResult",
            agentId: AGENT_ID,
            jobId: jobId,
            status: success ? "success" : "failure",
            logs: logs
        }));
    } else {
        console.log("WebSocket not connected. Cannot send job result.");
    }
}

function connect() {
    ws = new WebSocket(SERVER);
    console.log("Attempting to connect to server:", SERVER);

    ws.on('open', () => {
        console.log("Connected to server.");
        
        ws.send(JSON.stringify({
            type: "hello",
            agentId: AGENT_ID
        }));

        sendStats();
    });

    ws.on('message', msg => {
        let data;
        try {
            data = JSON.parse(msg);
        } catch(err) {
            console.error("Invalid message format:", err);
            return;
        }

        if (data.type === "runJob" && data.jobId && data.dockerfile) {
            console.log("Received runJob command:", data.jobId);
            runJob(data.jobId, data.dockerfile);
        }
        
        if (data.type === "ping") {
            console.log("Received ping from server. Sending pong...");
            ws.send(JSON.stringify({
                type: "pong",
                agentId: AGENT_ID
            }));
        }
    });

    ws.on('close', () => {
        console.log("Connection closed. Reconnecting in 5 seconds...");
        setTimeout(connect, 5000);
    });

    ws.on('error', (err) => {
        console.error("WebSocket error:", err.message);
    });
}

// FIXED: Actually call connect!
console.log("Starting agent...");
console.log("Agent ID:", AGENT_ID);
console.log("Server:", SERVER);

connect();

// Send stats periodically
setInterval(() => {
    sendStats();
}, 10000);