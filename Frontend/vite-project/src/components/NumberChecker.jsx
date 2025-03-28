import axios from "axios";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000";

const NumberChecker = () => {
    const [numbers, setNumbers] = useState("");
    const [results, setResults] = useState([]); // सुनिश्चित करें कि यह एक खाली array है
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverStatus, setServerStatus] = useState("unknown");

    // सर्वर स्टेटस चेक करें
    const checkServerStatus = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/whatsapp/status`);
            if (response.data.success) {
                setServerStatus(response.data.connected ? "connected" : "disconnected");
                setError(null);
            }
        } catch (err) {
            setServerStatus("disconnected");
            setError("Cannot connect to server. Please make sure the server is running.");
        }
    };

    // कंपोनेंट माउंट होने पर सर्वर स्टेटस चेक करें
    useEffect(() => {
        checkServerStatus();
        const interval = setInterval(checkServerStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const checkNumbers = async () => {
        if (!numbers.trim()) {
            setError("Please enter at least one number");
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]); // रिक्वेस्ट से पहले results को खाली करें

        try {
            const numbersToCheck = numbers.split(",")
                .map(num => num.trim())
                .filter(num => num.length > 0);

            console.log("Checking numbers:", numbersToCheck);

            const response = await axios.post(`${API_BASE_URL}/api/whatsapp/check`, {
                numbers: numbersToCheck,
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            console.log("Response received:", response.data);

            // कंसोल पर response की ज़्यादा जानकारी लॉग करें
            console.log("Response type:", typeof response.data);
            console.log("Has results?", response.data.hasOwnProperty('results'));
            console.log("Results type:", response.data.results ? typeof response.data.results : 'N/A');

            // सावधानीपूर्वक results को सेट करें
            if (response.data && response.data.results && Array.isArray(response.data.results)) {
                setResults(response.data.results);
            } else if (Array.isArray(response.data)) {
                // अगर response.data ही एक array है
                setResults(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
                setResults([]);
                setError("Invalid response format from server");
            }
        } catch (err) {
            console.error("❌ Error checking numbers", err);

            if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
                setError("Unable to connect to server. Please check if the backend is running.");
                setServerStatus("disconnected");
            } else if (err.response) {
                setError(`Server error: ${err.response.data.error || 'Unknown error'}`);
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">WhatsApp Number Checker</h2>
            
            {/* Server Status Indicator */}
            <div className="flex items-center justify-center mb-6 bg-gray-50 py-2 px-4 rounded-lg">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                    serverStatus === "connected" ? "bg-green-500 animate-pulse" : 
                    serverStatus === "disconnected" ? "bg-red-500" : "bg-yellow-500"
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                    {serverStatus === "connected" ? "Server Connected" : 
                     serverStatus === "disconnected" ? "Server Disconnected" : "Checking Connection..."}
                </span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Input Form */}
                <div className="w-full md:w-1/2 space-y-6">
                    <div>
                        <label htmlFor="numbers" className="block text-sm font-medium text-gray-700 mb-1">Enter Phone Numbers</label>
                        <input
                            id="numbers"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter numbers separated by commas"
                            value={numbers}
                            onChange={(e) => setNumbers(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-500">Example: 919876543210, 918765432109</p>
                    </div>

                    <button
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                        onClick={checkNumbers}
                        disabled={loading || serverStatus !== "connected"}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Checking...
                            </>
                        ) : "Check Numbers"}
                    </button>

                    {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
                </div>

                {/* Right Column - Results */}
                <div className="w-full md:w-1/2 border-t pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6 mt-4 md:mt-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Results</h3>
                    
                    {loading && (
                        <div className="flex items-center justify-center h-40">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                    
                    {!loading && Array.isArray(results) && results.length > 0 && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                            <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                                {results.map((res, index) => (
                                    <li key={index} className="flex justify-between p-3 hover:bg-gray-100 transition-all">
                                        <span className="font-medium text-gray-800">{res.number || res.formattedNumber}</span>
                                        {res.isOnWhatsApp ? (
                                            <span className="text-green-600 font-medium flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                </svg>
                                                Available
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-medium flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                                </svg>
                                                Not Available
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {!loading && Array.isArray(results) && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-gray-600">No results to display</p>
                            <p className="text-sm text-gray-500 mt-1 text-center px-4">Enter numbers and click Check</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
            © 2023 WhatsApp Number Checker | All Rights Reserved
        </div>
    </div>
    );
};

export default NumberChecker;