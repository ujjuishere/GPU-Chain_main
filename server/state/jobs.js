const jobs = {};

function createJob(jobId, agentId) {
  jobs[jobId] = {
    jobId,
    agentId,
    status: "running",
    logs: ""
  };
}

function completeJob(jobId, status, logs) {
  if (!jobs[jobId]) return;
  jobs[jobId].status = status;
  jobs[jobId].logs = logs;
  jobs[jobId].finishedAt = Date.now();
}

function getJob(jobId) {
  return jobs[jobId];
}

module.exports = {
  createJob,
  completeJob,
  getJob
};
