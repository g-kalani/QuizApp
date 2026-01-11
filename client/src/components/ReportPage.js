import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AISidebar from './AISidebar';

const ReportPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Sidebar state
    const [sidebar, setSidebar] = useState({
        show: false,
        loading: false,
        data: { question: '', correct: '', explanation: '' }
    });

    // Redirect to start if no quiz data; remove transient quiz state
    useEffect(() => {
        if (!state || !state.questions) {
            navigate('/');
        } else {
            localStorage.removeItem('quizQuestions');
            localStorage.removeItem('quizAnswers');
            localStorage.removeItem('quizVisited');
            localStorage.removeItem('quizTimeLeft');
        }
    }, [state, navigate]);
    // Early return if missing quiz data
    if (!state || !state.questions) {
        return null;
    }

    const { questions, answers } = state;

    // Fetch AI explanation via backend
    const handleAIExplain = async (q) => {
        setSidebar({ 
            show: true, 
            loading: true, 
            data: { question: q.question, correct: q.correct, explanation: '' } 
        });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/explain', 
                { question: q.question, correctAnswer: q.correct },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSidebar(prev => ({
                ...prev,
                loading: false,
                data: { ...prev.data, explanation: res.data.explanation }
            }));
        } catch (err) {
            setSidebar(prev => ({
                ...prev,
                loading: false,
                data: { ...prev.data, explanation: "AI service is currently busy. Please try again in a moment." }
            }));
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Quiz Report</h2>
            
            {/* Results table */}
            <div className="table-responsive shadow rounded">
                <table className="table table-hover align-middle bg-white">
                    <thead className="table-success">
                        <tr>
                            <th>Question</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>AI Tutor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((q, i) => (
                            <tr key={i} className={answers[i] === q.correct ? 'table-success' : 'table-danger'}>
                                {/* Render HTML entities */}
                                <td dangerouslySetInnerHTML={{ __html: q.question }} />
                                <td dangerouslySetInnerHTML={{ __html: answers[i] || "Not Attempted" }} />
                                <td dangerouslySetInnerHTML={{ __html: q.correct }} />
                                <td>
                                    <button 
                                        className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                        onClick={() => handleAIExplain(q)}
                                    >
                                        Explain
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-center">
                <button className="btn btn-primary mt-4 px-5" onClick={() => navigate('/')}>
                    Back to Start
                </button>
            </div>

            {/* AI Sidebar */}
            <AISidebar 
                show={sidebar.show} 
                onClose={() => setSidebar(prev => ({ ...prev, show: false }))} 
                loading={sidebar.loading} 
                data={sidebar.data} 
            />
        </div>
    );
};

export default ReportPage;