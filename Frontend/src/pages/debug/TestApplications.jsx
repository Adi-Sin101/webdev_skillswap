import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const TestApplications = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check if backend is running
      try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
          results.push({ test: 'Backend Health Check', status: '✅ PASS', details: 'Backend is running' });
        } else {
          results.push({ test: 'Backend Health Check', status: '❌ FAIL', details: 'Backend responded with error' });
        }
      } catch (error) {
        results.push({ test: 'Backend Health Check', status: '❌ FAIL', details: `Backend not reachable: ${error.message}` });
      }

      // Test 2: Check response endpoints
      try {
        const response = await fetch('http://localhost:5000/api/offers');
        if (response.ok) {
          results.push({ test: 'Offers API', status: '✅ PASS', details: 'Can fetch offers' });
        } else {
          results.push({ test: 'Offers API', status: '❌ FAIL', details: 'Cannot fetch offers' });
        }
      } catch (error) {
        results.push({ test: 'Offers API', status: '❌ FAIL', details: error.message });
      }

      // Test 3: Test response count endpoint
      try {
        const response = await fetch('http://localhost:5000/api/responses/offers/response-counts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerIDs: ['507f1f77bcf86cd799439011'] }) // dummy ID
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push({ test: 'Response Count API', status: '✅ PASS', details: `API working: ${JSON.stringify(data)}` });
        } else {
          const errorData = await response.text();
          results.push({ test: 'Response Count API', status: '❌ FAIL', details: `API error: ${errorData}` });
        }
      } catch (error) {
        results.push({ test: 'Response Count API', status: '❌ FAIL', details: error.message });
      }

      // Test 4: Check user authentication
      if (user) {
        results.push({ test: 'User Authentication', status: '✅ PASS', details: `Logged in as: ${user.name || user.email}` });
      } else {
        results.push({ test: 'User Authentication', status: '❌ FAIL', details: 'No user logged in' });
      }

      // Test 5: Test application submission (dummy)
      if (user) {
        try {
          const testResponse = await fetch('http://localhost:5000/api/responses/offers/507f1f77bcf86cd799439011/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicant: user._id,
              message: 'Test application',
              availability: 'Test',
              contactInfo: { email: 'test@test.com' }
            })
          });

          if (testResponse.ok || testResponse.status === 404) {
            results.push({ test: 'Application Endpoint', status: '✅ PASS', details: 'Endpoint is reachable (404 expected for dummy ID)' });
          } else {
            const errorData = await testResponse.text();
            results.push({ test: 'Application Endpoint', status: '⚠️ WARNING', details: `Unexpected response: ${errorData}` });
          }
        } catch (error) {
          results.push({ test: 'Application Endpoint', status: '❌ FAIL', details: error.message });
        }
      }

    } catch (error) {
      results.push({ test: 'Overall Test', status: '❌ FAIL', details: error.message });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Application System Debug</h1>
          
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
          >
            {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
          </button>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{result.status}</span>
                  <span className="font-semibold">{result.test}</span>
                </div>
                <p className="text-sm text-gray-600">{result.details}</p>
              </div>
            ))}
          </div>

          {testResults.length === 0 && !loading && (
            <p className="text-gray-500 text-center">Click "Run Diagnostic Tests" to check the application system.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestApplications;