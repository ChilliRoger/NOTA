import React from 'react';

export default function FormField({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <label className="block mb-4">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div>{children}</div>
    </label>
  );
}
