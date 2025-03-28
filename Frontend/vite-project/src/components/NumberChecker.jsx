import axios from "axios";
import { useState } from "react";

const NumberChecker = () => {
    const [numbers, setNumbers] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkNumbers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:5000/api/whatsapp/check", {
                numbers: numbers.split(",").map(num => num.trim()),
            });

            setResults(response.data);
        } catch (err) {
            console.error("❌ Error checking numbers", err);
            setError("Failed to connect to server. Please check if the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Check WhatsApp Numbers</h2>
                <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter numbers (comma-separated)"
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                />
                <button
                    className="w-full mt-4 p-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    onClick={checkNumbers}
                    disabled={loading}
                >
                    {loading ? "Checking..." : "Check"}
                </button>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <ul className="mt-4 space-y-2">
                    {results.map((res, index) => (
                        <li key={index} className="flex justify-between p-2 border rounded-lg bg-gray-50">
                            <span className="font-medium text-gray-700">{res.number}</span>
                            <span className={res.isOnWhatsApp ? "text-green-600" : "text-red-600"}>
                                {res.isOnWhatsApp ? "✅ Available" : "❌ Not Available"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NumberChecker;
