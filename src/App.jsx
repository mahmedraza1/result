import React, { useState, useEffect } from "react";
import config, { getApiBaseUrl } from "./config";

export default function ResultViewer() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Form states
  const [startId, setStartId] = useState(config.defaultStartId);
  const [total, setTotal] = useState(config.defaultTotal);
  const [concurrency, setConcurrency] = useState(config.batchSize);

  const fetchBatch = async (ids) => {
    // Get the base URL from our config helper
    const apiBase = getApiBaseUrl();
    
    // First check API health
    try {
      const healthCheck = await fetch(`${apiBase}/api/health`).then(res => res.json());
      console.log('API health check:', healthCheck);
    } catch (err) {
      console.error('API health check failed:', err);
      // Continue anyway, individual requests will handle errors
    }
    
    const responses = await Promise.all(
      ids.map((id) =>
        fetch(`${apiBase}/api/result/${id}${useProxy ? '?proxy=true' : ''}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Server responded with status ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.error) {
              // Server returned an error
              return { 
                id, 
                html: `<div class="bg-red-50 p-4 rounded-md text-red-700 mb-4">
                         <p class="font-bold">Error:</p>
                         <p>${data.error}</p>
                         ${data.errorDetail ? `<p class="text-sm mt-2">${data.errorDetail}</p>` : ''}
                       </div>` 
              };
            }
            return { id, html: data.result || 'No data returned' };
          })
          .catch((err) => ({ 
            id, 
            html: `<div class="bg-red-50 p-4 rounded-md text-red-700">
                    <p class="font-bold">Request Error:</p>
                    <p>${err.message}</p>
                   </div>` 
          }))
      )
    );
    return responses;
  };

  const fetchAll = async () => {
    setLoading(true);
    setStarted(true);
    setResults([]); // Clear previous results
    
    let collected = [];
    let batchIds = [];

    for (let i = 0; i < total; i++) {
      batchIds.push(startId + i);

      if (batchIds.length === concurrency || i === total - 1) {
        const batchResults = await fetchBatch(batchIds);
        collected = [...collected, ...batchResults];

        // Deduplicate by ID (avoid React duplicate key warnings)
        const unique = Array.from(new Map(collected.map(item => [item.id, item])).values());

        setResults(unique);
        batchIds = [];
      }
    }

    setLoading(false);
  };

  // Start fetching when user clicks the button, not automatically
  useEffect(() => {
    // Component mount cleanup
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-200 p-8 w-full min-h-screen mx-auto">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            BISE Faisalabad Results
          </h1>
          <p className="text-gray-600">Fetch and view examination results with ease</p>
        </div>
        
        {/* Form controls */}
        <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-white shadow-lg w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Search Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startId" className="block text-sm font-medium text-gray-700 mb-2">
                Starting Roll Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="startId"
                  value={startId}
                  onChange={(e) => setStartId(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="400000"
                  max="500000"
                  placeholder="Enter starting roll number"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Roll numbers between 400000 and 500000</p>
            </div>
            <div>
              <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Results
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="total"
                  value={total}
                  onChange={(e) => setTotal(parseInt(e.target.value) || 1)}
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="1"
                  max="500"
                  placeholder="How many results to fetch"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Maximum 500 results at a time</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="concurrency" className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2">
              <span>Batch Size (requests at a time)</span>
              <span className="text-blue-600 font-semibold">{concurrency}</span>
            </label>
            <input
              type="range"
              id="concurrency"
              value={concurrency}
              onChange={(e) => setConcurrency(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              min="1"
              max="50"
              step="1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Slower but stable)</span>
              <span>50 (Faster but may fail)</span>
            </div>
          </div>
          
          <button
            onClick={fetchAll}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex justify-center items-center transition-all duration-300 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Fetching Results
              </>
            )}
          </button>
        </div>
        
        {/* Status and progress */}
        {started && (
          <div className="mb-6 p-5 rounded-lg bg-white border border-gray-200 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
              <div>
                <span className="text-sm font-semibold text-gray-600">Starting Roll:</span>
                <span className="ml-2 text-lg font-bold text-blue-700">{startId}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Total Requested:</span>
                <span className="ml-2 text-lg font-bold text-purple-700">{total}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Batch Size:</span>
                <span className="ml-2 text-lg font-bold text-indigo-700">{concurrency}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${loading ? "bg-blue-600" : "bg-green-600"}`} 
                style={{ width: `${Math.min(100, (results.length / total) * 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-900">{Math.min(100, Math.round((results.length / total) * 100))}%</span>
            </div>
            
            {loading ? (
              <div className="mt-3 flex items-center justify-center text-blue-700">
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing... {results.length} of {total} records retrieved</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-center text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Complete! {results.length} records retrieved</span>
              </div>
            )}
          </div>
        )}

        {/* Results list */}
        {started && results.length > 0 && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-gray-200 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Results ({results.length} records)
              </h2>
            </div>
            
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">
                    <span className="text-sm text-gray-500 block">Roll Number</span>
                    <span className="text-blue-600">{item.id}</span>
                  </h3>
                  <button 
                    className="text-gray-500 hover:text-blue-700 transition-colors"
                    onClick={() => {
                      // You could add toggle functionality here if needed
                      // This is just for visual enhancement now
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="border rounded-lg p-4 overflow-auto bg-gray-50">
                  <div id={`result-${item.id}`} dangerouslySetInnerHTML={{ __html: item.html }} />
                </div>
              </div>
            ))}
          </div>
        )}
      
        {/* No results message */}
        {started && results.length === 0 && !loading && (
          <div className="mb-6 text-center p-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-800 font-medium text-lg">No results found</p>
            <p className="text-amber-700 mt-1">Please try different search parameters or check the roll number range.</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="w-full mt-10 pt-6 border-t border-gray-300 text-center">
          <p className="flex items-center justify-center text-gray-700">
            <span className="mr-1">Made with</span>
            <span className="text-red-500 text-xl mx-1 animate-pulse">❤️</span>
            <span className="ml-1">by</span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-2">
              Mark Maverick
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
