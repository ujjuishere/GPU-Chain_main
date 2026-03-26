import React, { useState, useEffect } from 'react';
import { HardDrive, Thermometer, Activity, Zap } from 'lucide-react';

const API_BASE = 'http://172.20.10.2:8080';

const DUMMY_GPUS = [
  {
    id: 'dummy-1',
    name: 'NVIDIA RTX 4090',
    status: 'idle',
    memTotal: 32000,
    memUsed: 18000,
    memFree: 14000,
    util: 65,
    temp: 58,
    utilization: 72
  },
  {
    id: 'dummy-2',
    name: 'NVIDIA RTX 4080',
    status: 'idle',
    memTotal: 24000,
    memUsed: 8000,
    memFree: 16000,
    util: 42,
    temp: 45,
    utilization: 35
  }
];

export default function GPUListPage() {
  const [agents, setAgents] = useState([]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agents`);
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setAgents([]);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Combine real agents and dummy GPUs
  const allGPUs = [];
  agents.forEach(agent => {
    if (agent.gpus && agent.gpus.length > 0) {
      agent.gpus.forEach(gpu => {
        allGPUs.push({ ...gpu, agentId: agent.agentId });
      });
    }
  });

  // Add dummy GPUs
  const displayGPUs = [...allGPUs, ...DUMMY_GPUS];

  const totalGPUs = displayGPUs.length;
  const avgUtil = displayGPUs.length > 0 
    ? Math.round(displayGPUs.reduce((sum, gpu) => sum + gpu.util, 0) / displayGPUs.length)
    : 0;
  const totalMemory = displayGPUs.reduce((sum, gpu) => sum + gpu.memTotal, 0);
  const usedMemory = displayGPUs.reduce((sum, gpu) => sum + gpu.memUsed, 0);

  return (
    <div className="max-w-7xl mx-auto pt-24">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total GPUs</p>
            <HardDrive className="w-5 h-5 text-[#76B900]" />
          </div>
          <p className="text-3xl font-bold text-[#76B900]">{totalGPUs}</p>
        </div>

        <div className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Avg Utilization</p>
            <Activity className="w-5 h-5 text-[#76B900]" />
          </div>
          <p className="text-3xl font-bold text-[#76B900]">{avgUtil}%</p>
        </div>

        <div className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Memory</p>
            <Zap className="w-5 h-5 text-[#76B900]" />
          </div>
          <p className="text-3xl font-bold text-[#76B900]">{Math.round(totalMemory / 1024)}GB</p>
        </div>

        <div className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Memory Used</p>
            <Zap className="w-5 h-5 text-[#76B900]" />
          </div>
          <p className="text-3xl font-bold text-[#76B900]">{Math.round(usedMemory / 1024)}GB</p>
        </div>
      </div>

      {/* GPU Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-white">GPU Devices</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayGPUs.map((gpu, idx) => (
            <div key={idx} className="bg-black rounded-lg p-6 border border-[#76B900]/30 hover:border-[#76B900] transition shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{gpu.name}</h3>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${\n                      gpu.status === 'idle'\n                        ? 'bg-[#76B900] text-black border border-[#76B900] shadow-lg shadow-[#76B900]/50'\n                        : 'bg-gray-600 text-white border border-gray-600'\n                    }`}>\n                      {gpu.status || 'idle'}\n                    </span>\n                  </div>\n                  {gpu.agentId && (\n                    <p className="text-xs text-gray-500 mt-2">Agent: {gpu.agentId}</p>\n                  )}\n                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#76B900]">{gpu.util}%</p>\n                  <p className="text-xs text-gray-500">Utilization</p>
                </div>
              </div>\n\n              {/* Progress Bars and Stats */}\n              <div className="space-y-4">\n                {/* Memory */}\n                <div>\n                  <div className="flex justify-between items-center mb-1">\n                    <span className="text-sm text-gray-400">Memory</span>\n                    <span className="text-sm font-mono text-gray-300">\n                      {gpu.memUsed}MB / {gpu.memTotal}MB\n                    </span>\n                  </div>\n                  <div className="w-full bg-gray-800 rounded-full h-2">\n                    <div\n                      className="bg-[#76B900] h-2 rounded-full transition-all"\n                      style={{\n                        width: `${(gpu.memUsed / gpu.memTotal) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-600">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">GPU Util</p>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-white" />
                      <span className="font-mono text-sm text-white">{gpu.util}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Temperature</p>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-white" />
                      <span className="font-mono text-sm text-white">{gpu.temp}°C</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Memory Util</p>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-4 h-4 text-white" />
                      <span className="font-mono text-sm text-white">{gpu.utilization}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-black rounded-lg p-4 border border-gray-600 text-center">
        <p className="text-sm text-gray-400">
          Showing {displayGPUs.length} GPU(s)
        </p>
      </div>
    </div>
  );
}
