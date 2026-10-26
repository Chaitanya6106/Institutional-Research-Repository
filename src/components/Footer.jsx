import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Institutional Research Repository. All rights reserved.</p>
      </div>
    </footer>
  );
}
