import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  // Replace this with your actual global auth state indicator block later
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(true);

  if (userIsAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <p>Please log in using the API Gateway login portal endpoint views.</p>
    </div>
  );
}