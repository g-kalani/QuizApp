import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StartPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

   const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Clear any previous session/quiz state
        localStorage.clear();

        try {
            // Request new session token from server
            const response = await axios.post('http://localhost:5000/api/start', { email });

            // Store session token and user email
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userEmail', email);

            // Navigate to quiz
            navigate('/quiz');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center vh-100">
            <div className="card p-5 text-center shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="mb-4">
                    <h1 className="display-6 fw-bold text-primary">QuizMaster AI</h1>
                    <p className="text-muted">Test your knowledge and learn with AI</p>
                </div>
                
                <form onSubmit={handleStart}>
                    <div className="mb-4 text-start">
                        <label className="form-label small fw-bold">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control form-control-lg" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <button className="btn btn-primary btn-lg w-100 py-3" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : "Start Quiz"}
                    </button>
                    {error && <div className="alert alert-danger mt-3 py-2 small">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default StartPage;