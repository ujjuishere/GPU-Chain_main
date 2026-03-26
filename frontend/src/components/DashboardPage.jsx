import React, { useState, useEffect } from 'react';
import { RefreshCw, Send, Download, Cpu, HardDrive, Thermometer, Activity } from 'lucide-react';

const API_BASE = 'http://172.20.10.2:8080';

export default function DashboardPage() {
  const [agents, setAgents] = useState([]);
  const [jobs, setJobs] = useState({});
  const [dockerfile, setDockerfile] = useState(`FROM python:3.9-slim
RUN echo "Hello from GPU cluster!"
RUN python3 -c "print('Python is working!')"
CMD ["echo", "Job completed successfully"]`);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/agents`);
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitJob = async () => {
    if (!dockerfile.trim()) {
      alert('Please enter a Dockerfile');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dockerfile })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to submit job');
        return;
      }

      const data = await res.json();
      setJobs(prev => ({
        ...prev,
        [data.jobId]: { jobId: data.jobId, agentId: data.agentId, status: 'running', logs: '' }
      }));

      // Poll for result
      pollJobResult(data.jobId);
    } catch (err) {
      console.error('Failed to submit job:', err);
      alert('Failed to submit job');
    } finally {
      setSubmitting(false);
    }
  };

  const pollJobResult = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
        const data = await res.json();
        
        setJobs(prev => ({
          ...prev,
          [jobId]: data
        }));

        if (data.status === 'success' || data.status === 'failure') {
          clearInterval(interval);
          fetchAgents(); // Refresh agents to show idle status
        }
      } catch (err) {
        console.error('Failed to fetch job:', err);
      }
    }, 2000);
  };

  const downloadLogs = (jobId) => {
    const job = jobs[jobId];
    if (!job || !job.logs) return;

    const blob = new Blob([job.logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-${jobId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto pt-24">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-12">
          <div>
          </div>
          <button
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-[#76B900]/50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {agents.length === 0 ? (
          <div className="w-full h-[400px] bg-black border border-[#76B900]/30 rounded-xl flex items-center justify-center shadow-lg shadow-[#76B900]/10">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6">
                <Cpu className="w-10 h-10 text-[#76B900]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Agents Connected</h3>
              <p className="text-gray-400 max-w-sm">
                Your GPU agents will appear here once they connect to the cluster. Start an agent to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div key={agent.agentId} className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-lg text-white">{agent.agentId}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    agent.status === 'idle' 
                      ? 'bg-[#76B900] text-black border border-[#76B900] shadow-lg shadow-[#76B900]/50'
                      : 'bg-gray-600 text-white border border-gray-600'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* System Info */}
                {agent.system && (
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Cpu className="w-4 h-4" />
                      {agent.system.cpuModel?.substring(0, 40)}...
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <HardDrive className="w-4 h-4" />
                      {agent.system.freeMemoryMB}MB / {agent.system.totalMemoryMB}MB free
                    </div>
                  </div>
                )}

                {/* GPUs */}
                {agent.gpus && agent.gpus.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase">GPUs</h4>
                    {agent.gpus.map((gpu, idx) => (
                      <div key={idx} className="bg-gray-900/50 border border-[#76B900]/20 rounded p-3 space-y-2">
                        <div className="font-medium text-[#76B900]">{gpu.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Memory:</span>
                            <div className="font-mono text-gray-200">
                              {gpu.memUsed}MB / {gpu.memTotal}MB
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Utilization:</span>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span className="font-mono text-gray-200">{gpu.util}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Temp:</span>
                            <div className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              <span className="font-mono text-gray-200">{gpu.temp}°C</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Mem Util:</span>
                            <div className="font-mono text-gray-200">{gpu.utilization}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No GPU info available</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Submission */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
          <Send className="w-6 h-6 text-[#76B900]" />
          Submit Job
        </h2>
        <div className="bg-black rounded-lg p-6 border border-[#76B900]/30 shadow-lg shadow-[#76B900]/10">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dockerfile
          </label>
          <textarea
            value={dockerfile}
            onChange={(e) => setDockerfile(e.target.value)}
            className="w-full h-48 bg-gray-900/50 border border-[#76B900]/30 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] shadow-lg shadow-[#76B900]/10"
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '14px', fontWeight: 500, lineHeight: '1.5' }}
            placeholder="Enter your Dockerfile content..."
          />
          <button
            onClick={submitJob}
            disabled={submitting || agents.filter(a => a.status === 'idle').length === 0}
            className="mt-4 px-6 py-3 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#76B900]/50"
          >
            {submitting ? 'Submitting...' : 'Submit Job'}
          </button>
          {agents.filter(a => a.status === 'idle').length === 0 && (
            <p className="mt-2 text-sm text-gray-400">No idle agents available</p>
          )}
        </div>
      </div>

      {/* Jobs Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
          <Activity className="w-6 h-6 text-[#76B900]" />
          Jobs
        </h2>
        {Object.keys(jobs).length === 0 ? (
          <div className="bg-black rounded-lg p-8 text-center text-gray-400 border border-[#76B900]/20 shadow-lg shadow-[#76B900]/10">
            No jobs submitted yet
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(jobs).reverse().map(job => (
              <div key={job.jobId} className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-sm text-gray-400">Job ID: {job.jobId}</div>
                    <div className="font-mono text-sm text-gray-400">Agent: {job.agentId}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'success' 
                        ? 'bg-[#76B900] text-black border border-[#76B900] shadow-lg shadow-[#76B900]/50'
                        : job.status === 'failure'
                        ? 'bg-gray-600 text-white border border-gray-600'
                        : 'bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/50'
                    }`}>
                      {job.status}
                    </span>
                    {job.logs && (
                      <button
                        onClick={() => downloadLogs(job.jobId)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded transition-colors shadow-lg shadow-[#76B900]/30"
                      >
                        <Download className="w-4 h-4" />
                        Download Logs
                      </button>
                    )}
                  </div>
                </div>
                {job.logs && (
                  <div className="bg-black rounded p-4 max-h-64 overflow-y-auto border border-[#76B900]/20">
                    <pre className="text-xs text-[#76B900] whitespace-pre-wrap font-mono">
                      {job.logs}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
