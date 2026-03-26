import React from 'react';
import { Zap, Users, TrendingUp, ArrowRight, HardDrive, CheckCircle, Cpu, Gauge, Shield, BarChart3, Clock, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'GPU Orchestration',
      description: 'Automatic workload distribution across available GPU resources with smart load balancing'
    },
    {
      icon: BarChart3,
      title: 'Live GPU Metrics',
      description: 'Monitor performance metrics, utilization rates, and resource consumption in real-time'
    },
    {
      icon: Shield,
      title: 'Secure Isolated Runs',
      description: 'Secure job execution with isolated containers and comprehensive access controls'
    },
    {
      icon: Clock,
      title: 'One‑Click Docker Jobs',
      description: 'Submit Docker jobs instantly and get results in minutes with optimized execution'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'ML Engineer at TechCorp',
      text: 'GPU Cluster transformed how we manage our compute resources. We reduced deployment time by 60%.',
      avatar: '👨‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'CTO at DataSystems',
      text: 'The monitoring capabilities are outstanding. We now have full visibility into our GPU cluster.',
      avatar: '👩‍💼'
    },
    {
      name: 'Emma Rodriguez',
      role: 'DevOps Lead at CloudInnovate',
      text: 'Seamless integration with our Docker workflow. Our team loves the user-friendly interface.',
      avatar: '👨‍💻'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Jobs Processed', icon: Zap },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '50%', label: 'Cost Reduction', icon: TrendingUp },
    { value: '24/7', label: 'Support', icon: Clock }
  ];

  return (
    <div className="w-full">
      {/* Hero Section - Full Page */}
      <section className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full px-6">
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-6 text-white leading-tight">
              Harness the Power of GPU Computing
            </h1>
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              GPU Cluster is the enterprise-grade platform for managing distributed GPU workloads. Scale your AI and ML workloads with confidence.
            </p>
            <div className="flex gap-6 justify-center">
              <button className="px-10 py-4 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg font-semibold transition-all transform hover:scale-105 text-lg shadow-lg shadow-[#76B900]/50">
                Get Started Free
              </button>
              <button className="px-10 py-4 border-2 border-[#76B900] hover:bg-[#76B900] hover:text-black rounded-lg font-semibold transition-all text-lg text-[#76B900] shadow-lg shadow-[#76B900]/30">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Page with Right 3D Model */}
      <section className="w-full min-h-screen flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="mb-20">
            <h2 className="text-5xl font-bold mb-6 text-white">Powerful Features Built for Scale</h2>
            <p className="text-2xl text-gray-400">Everything you need to manage GPU resources efficiently</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Compact feature tiles column (slightly longer and wider) */}
            <div className="flex flex-col gap-5 max-w-sm">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-black rounded-lg p-5 border border-[#76B900]/30 hover:border-[#76B900] transition group shadow-lg shadow-[#76B900]/10 hover:shadow-[#76B900]/20">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  </div>
                );
              })}
            </div>

            {/* Right: 3D model viewer without container */}
            <model-viewer
              src="/msi_rtx_3080_graphics_card.glb"
              alt="MSI RTX 3080"
              camera-controls
              auto-rotate
              interaction-prompt="none"
              exposure="0.9"
              shadow-intensity="1"
              className="w-full h-[500px] lg:h-[700px] -mt-32 lg:-mt-48"
              disable-zoom
            ></model-viewer>
          </div>
        </div>
      </section>
      {/* How It Works - Full Page */}
      <section className="w-full min-h-screen flex items-center justify-center py-20 -mt-40">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-white">How It Works</h2>
            <p className="text-2xl text-gray-400">Three simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: 1, title: 'Write Your Job', desc: 'Define your workload in a Dockerfile with all dependencies' },
              { step: 2, title: 'Submit to Cluster', desc: 'One-click submission to available GPU resources' },
              { step: 3, title: 'Monitor & Collect', desc: 'Track execution in real-time and download results' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-black rounded-xl p-10 border border-gray-600 h-full flex flex-col justify-between">
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-2xl text-black">
                    {item.step}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                    <p className="text-gray-300 text-lg">{item.desc}</p>
                  </div>
                </div>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-white/5 border border-gray-600 rounded-2xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-3 blur-3xl"></div>
            <div className="relative text-center">
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to Scale Your GPU Workloads?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join hundreds of teams using GPU Cluster to accelerate their AI and ML projects
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-[#76B900]/50">
                  Start Free Trial
                </button>
                <button className="px-8 py-3 border border-[#76B900] hover:bg-[#76B900] hover:text-black rounded-lg font-semibold transition-all text-[#76B900] shadow-lg shadow-[#76B900]/30">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="w-full py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-6">Everything you need to get started is ready</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76B900]" />
              <span className="text-gray-300">Free account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76B900]" />
              <span className="text-gray-300">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#76B900]" />
              <span className="text-gray-300">Deploy in minutes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
