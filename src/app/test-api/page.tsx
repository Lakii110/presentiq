'use client';

import { getApiBaseUrl } from '@/lib/env';
import { useEffect, useState } from 'react';

export default function TestApiPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [envVar, setEnvVar] = useState('');
  const [healthStatus, setHealthStatus] = useState('');

  useEffect(() => {
    // Get the API URL
    const url = getApiBaseUrl();
    setApiUrl(url);
    setEnvVar(process.env.NEXT_PUBLIC_API_URL || 'NOT SET');

    // Test the health endpoint
    fetch(`${url}/health`)
      .then(res => res.json())
      .then(data => setHealthStatus(JSON.stringify(data)))
      .catch(err => setHealthStatus(`ERROR: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Configuration Test</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2>Environment Variable</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {envVar}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2>Computed API URL</h2>
        <p><strong>getApiBaseUrl():</strong> {apiUrl}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2>Health Check</h2>
        <p><strong>Status:</strong> {healthStatus || 'Testing...'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#ffffcc' }}>
        <h2>Instructions</h2>
        <p>1. If API URL shows port 8001, the browser is caching old code</p>
        <p>2. Press Ctrl+Shift+R to hard refresh</p>
        <p>3. Or open in incognito/private window</p>
        <p>4. Health check should return: {`{"status":"ok"}`}</p>
      </div>
    </div>
  );
}
