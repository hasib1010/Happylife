// src/app/admin/db-init/page.js
'use client';

import { useState } from 'react';

export default function DatabaseInitPage() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const testDbConnection = async () => {
    setStatus('loading');
    setMessage('Testing database connection...');
    
    try {
      const response = await fetch('/api/admin/test-db');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Database connection successful! ' + data.message);
      } else {
        setStatus('error');
        setMessage('Database connection failed: ' + data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error testing database: ' + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Database Initialization</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Test Database Connection</h2>
        
        <button
          onClick={testDbConnection}
          disabled={status === 'loading'}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            status === 'loading' 
              ? 'bg-gray-400' 
              : status === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : status === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {status === 'loading' ? 'Testing...' : 'Test Connection'}
        </button>
        
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            status === 'success' 
              ? 'bg-green-50 text-green-800' 
              : status === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-gray-50 text-gray-800'
          }`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Database Configuration Guide</h2>
        
        <div className="prose">
          <h3>MongoDB Connection</h3>
          <p>Make sure your <code>.env.local</code> file contains the proper MongoDB connection string:</p>
          
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            MONGODB_URI=mongodb://localhost:27017/happylife
            # or
            MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/happylife
          </pre>
          
          <h3>Troubleshooting</h3>
          <ul>
            <li>Ensure MongoDB is running if using a local installation</li>
            <li>Check network access if using MongoDB Atlas</li>
            <li>Verify username and password in connection string</li>
            <li>Make sure IP access is allowed in MongoDB Atlas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
