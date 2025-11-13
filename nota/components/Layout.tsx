import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen flex items-start justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-md shadow p-6">{children}</div>
    </div>
  );
}
