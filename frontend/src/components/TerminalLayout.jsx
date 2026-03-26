import React from 'react';

export default function TerminalLayout({ children }) {
  return (
    <div className="terminal-root min-h-screen flex items-center justify-center p-6">
      <div className="terminal-window w-full max-w-6xl">
        <div className="terminal-topbar flex items-center gap-3 px-4 py-2">
          <div className="terminal-dots flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="terminal-title text-slate-400 font-mono text-sm">gpu-cli</div>
        </div>

        <div className="terminal-body p-6">{children}</div>
      </div>
    </div>
  );
}
