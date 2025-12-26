
import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-cyan-900 animate-gradient"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.3),transparent_50%)]"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
    </div>
  );
};
