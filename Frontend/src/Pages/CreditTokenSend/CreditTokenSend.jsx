
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import { FaGift } from "react-icons/fa";
import "./CreditTokenSend.css";

const CreditTokenSend = () => {
    const [username, setUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        if (username.trim() === "") {
            toast.error("Please enter a username");
            return;
        }
        if (!amount || Number(amount) <= 0) { 
            toast.error("Please enter a valid amount");
            return;
        }

        let userRes = confirm("Are you sure to gift token? ");
        if (!userRes) return;

        try {
            setLoading(true);
            const { data } = await axios.post("/rating/giftCredits", {
                username: username.trim(),
                amount: Number(amount),
            });
            toast.success(data.message || "Credits sent successfully");
            setUsername("");
            setAmount("");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Something went wrong";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="credit-send-container">
            <div className="credit-send-card">
                <div className="credit-send-header">
                    <FaGift className="gift-icon" />
                    <h2>Gift Credit Token</h2>
                </div>
                <p className="credit-send-subtext">
                    Send learning credits to another user
                </p>

                <form onSubmit={handleSubmit} className="credit-send-form">
                    <div className="form-group">
                        <label>Recipient Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="Enter amount of tokens"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="gift-button" disabled={loading}>
                        {loading ? (
                            <Spinner animation="border" size="sm" variant="light" />
                        ) : (
                            <>
                                <FaGift /> Gift
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreditTokenSend;