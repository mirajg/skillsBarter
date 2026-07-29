
import React, { useState, useEffect } from "react";

const Ads = () => {
    const [timeLeft, setTimeLeft] = useState(10);
    const [isClaimed, setIsClaimed] = useState(false);

    useEffect(() => {
        // Stop timer when it reaches 0
        if (timeLeft <= 0) return;

        // Decrease time by 1 second
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleClaim = () => {
        setIsClaimed(true);
        alert("Token claimed successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-900 bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Watch Ad & Earn</h1>

                {timeLeft > 0 ? (
                    <div className="my-6">
                        <p className="text-gray-400 mb-2">Please wait for the timer to finish...</p>
                        <span className="text-5xl font-extrabold text-blue-500 animate-pulse">
                            {timeLeft}s
                        </span>
                    </div>
                ) : (
                    <div className="my-6">
                        <p className="text-green-400 font-semibold mb-4">Your reward is ready!</p>
                        <button
                            onClick={handleClaim}
                            disabled={isClaimed}
                            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                                isClaimed
                                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                                    : "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                            }`}
                        >
                            {isClaimed ? "Token Claimed" : "Claim Token"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ads;