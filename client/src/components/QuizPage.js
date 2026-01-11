import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './QuizPage.css'; 

const QuizPage = () => {
    const navigate = useNavigate();
    const isFetched = useRef(false);

    // State initialization
    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('quizQuestions');
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(questions.length === 0);
    const [currentIdx, setCurrentIdx] = useState(0);
    
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem('quizAnswers');
        return saved ? JSON.parse(saved) : {};
    });

    const [visited, setVisited] = useState(() => {
        const saved = localStorage.getItem('quizVisited');
        return saved ? new Set(JSON.parse(saved)) : new Set([0]);
    });

    const [reviewed, setReviewed] = useState(() => {
        const saved = localStorage.getItem('quizReviewed');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('quizTimeLeft');
        return saved ? parseInt(saved) : 1800; // 30 minutes
    });

    // Modal visibility
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Session & data fetch
    useEffect(() => {
        const token = localStorage.getItem('token');
        const isCompleted = localStorage.getItem('quizCompleted');
        if (!token || isCompleted === 'true') {
            navigate('/'); 
            return;
        }
        const fetchQuestions = async () => {
            if (questions.length > 0) { setLoading(false); return; }
            if (isFetched.current) return;
            try {
                isFetched.current = true;
                setLoading(true); 
                const res = await axios.get('https://opentdb.com/api.php?amount=15&type=multiple'); 
                if (res.data.response_code === 0 && res.data.results.length > 0) {
                    const data = res.data.results.map(q => ({
                        question: q.question, 
                        options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5), 
                        correct: q.correct_answer 
                    }));
                    setQuestions(data);
                    localStorage.setItem('quizQuestions', JSON.stringify(data));
                    setLoading(false); 
                }
            } catch (error) { setLoading(false); }
        };
        if (questions.length === 0) fetchQuestions();
    }, [navigate, questions.length]);

    // Timer and auto-submit
    useEffect(() => {
        // Auto-submit when time reaches 0
        if (timeLeft <= 0) {
            confirmFinalSubmit(); // Submit immediately
            return;
        }

        // Toast alerts
        if (timeLeft === 900) {
            toast('⏰ 15 minutes remaining! Halfway mark.', {
                duration: 4000,
                position: 'top-right',
                style: { background: '#333', color: '#fff' },
            });
        }
        if (timeLeft === 60) {
            toast.error('⚠️ Only 1 minute left!', {
                duration: 6000,
                position: 'top-right',
            });
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const nextTime = prev - 1;
                localStorage.setItem('quizTimeLeft', nextTime);
                return nextTime;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Sync persistent storage
    useEffect(() => {
        localStorage.setItem('quizAnswers', JSON.stringify(answers));
        localStorage.setItem('quizVisited', JSON.stringify(Array.from(visited)));
        localStorage.setItem('quizReviewed', JSON.stringify(Array.from(reviewed)));
    }, [answers, visited, reviewed]);

    const handleNavigate = (idx) => {
        setCurrentIdx(idx); 
        setVisited(prev => new Set(prev).add(idx)); 
    };

    const handleAnswerSelect = (opt) => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (newAnswers[currentIdx] === opt) {
                delete newAnswers[currentIdx];
            } else {
                newAnswers[currentIdx] = opt;
            }
            return newAnswers;
        });
    };

    const toggleReview = () => {
        const newReviewed = new Set(reviewed);
        if (newReviewed.has(currentIdx)) newReviewed.delete(currentIdx);
        else newReviewed.add(currentIdx);
        setReviewed(newReviewed);
    };

    // Finalize and submit
    const confirmFinalSubmit = () => {
        localStorage.setItem('quizCompleted', 'true');
        localStorage.removeItem('quizTimeLeft');
        localStorage.removeItem('quizAnswers');
        localStorage.removeItem('quizVisited');
        localStorage.removeItem('quizQuestions');
        localStorage.removeItem('quizReviewed');
        navigate('/report', { state: { questions, answers } }); 
    };

    const attemptedCount = Object.keys(answers).length;
    
    if (loading) {
        return (
            <div className="container vh-100 d-flex flex-column justify-content-center align-items-center">
                <div className="spinner-border text-primary" style={{width: '3.5rem', height: '3.5rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-4 text-primary fw-bold">Loading Assessment...</h4>
                <p className="text-muted">Fetching 15 questions for your session.</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Toaster />

            {/* Header */}
            <div className="d-flex justify-content-between mb-4 align-items-center bg-white p-3 rounded shadow-sm border border-0">
                <div>
                    <h4 className="mb-0 fw-bold text-primary">Quiz Portal</h4>
                    <small className="text-muted">General Knowledge Assessment</small>
                </div>
                <div className="text-end">
                    <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Time Remaining</small>
                    <h4 className={`mb-0 fw-bold ${timeLeft < 60 ? 'text-danger animate-pulse' : 'text-dark'}`}>
                        ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </h4>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    {questions.length > 0 && (
                        <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '15px' }}>
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                <span className="badge rounded-pill bg-primary px-3 py-2 text-white">Question {currentIdx + 1} of 15</span>
                                <div className="progress flex-grow-1 mx-3" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: `${(attemptedCount / 15) * 100}%` }}></div>
                                </div>
                            </div>

                            <h5 className="lh-base mb-4 fw-bold" style={{ color: '#2d3436' }} dangerouslySetInnerHTML={{ __html: questions[currentIdx].question }} />
                            
                            <div className="d-grid gap-3">
                                {questions[currentIdx].options.map((opt, i) => (
                                    <button 
                                        key={i}
                                        className={`btn btn-lg text-start py-3 px-4 transition-all border-2 ${
                                            answers[currentIdx] === opt ? 'btn-primary border-primary shadow-sm' : 'btn-outline-light text-dark border-light-subtle bg-light-hover'
                                        }`}
                                        onClick={() => handleAnswerSelect(opt)}
                                        style={{ borderRadius: '12px', fontSize: '1rem' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className={`me-3 d-flex align-items-center justify-content-center rounded-circle ${answers[currentIdx] === opt ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span dangerouslySetInnerHTML={{ __html: opt }} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                                <button className={`btn btn-sm ${reviewed.has(currentIdx) ? 'btn-warning shadow-sm fw-bold' : 'btn-outline-warning'}`} onClick={toggleReview}>
                                    {reviewed.has(currentIdx) ? '⭐ Marked' : '☆ Mark for Review'}
                                </button>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-link text-decoration-none text-secondary fw-bold" disabled={currentIdx === 0} onClick={() => handleNavigate(currentIdx - 1)}>← Prev</button>
                                    {currentIdx === 14 ? 
                                        <button className="btn btn-success px-4 fw-bold shadow-sm" style={{borderRadius:'8px'}} onClick={() => setShowSubmitModal(true)}>Submit Quiz</button> :
                                        <button className="btn btn-primary px-4 fw-bold shadow-sm" style={{borderRadius:'8px'}} onClick={() => handleNavigate(currentIdx + 1)}>Next →</button>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-3" style={{ borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-3 text-uppercase text-muted" style={{ fontSize: '0.8rem' }}>Overview</h6>
                        <div className="quiz-nav-grid mb-3">
                            {questions.map((_, i) => {
                                let statusClass = "";
                                if (answers[i]) statusClass = "nav-answered"; 
                                else if (visited.has(i)) statusClass = "nav-visited"; 
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleNavigate(i)}
                                        className={`btn-nav fw-bold ${statusClass} ${currentIdx === i ? 'nav-active' : ''}`}
                                    >
                                        {reviewed.has(i) && <div className="review-triangle"></div>}
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <hr className="my-3 opacity-10" />
                        <div className="px-2">
                            <div className="legend-item"><div className="triangle-legend"></div><span>Marked for Review</span></div>
                            <div className="legend-item"><div className="legend-square bg-success"></div><span>Answered</span></div>
                            <div className="legend-item"><div className="legend-square border border-info"></div><span>Visited</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit modal */}
            {showSubmitModal && (
                <div className="modal-backdrop d-flex align-items-center justify-content-center" 
                     style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
                    <div className="card shadow-lg p-4 text-center" style={{ maxWidth: '450px', width: '90%', borderRadius: '20px' }}>
                        <div className="mb-3">
                            <h4 className="fw-bold mt-2">Finish Quiz?</h4>
                            <p className="text-muted small">You can still go back and change your answers.</p>
                        </div>
                        <div className="bg-light p-3 rounded mb-4 text-start">
                            <div className="d-flex justify-content-between mb-2">
                                <span>✅ Attempted:</span>
                                <span className="fw-bold">{attemptedCount} / 15</span>
                            </div>
                            {reviewed.size > 0 && (
                                <div className="d-flex justify-content-between text-warning">
                                    <span>⭐ Marked for Review:</span>
                                    <span className="fw-bold">{reviewed.size}</span>
                                </div>
                            )}
                        </div>
                        <div className="d-grid gap-2">
                            <button className="btn btn-primary btn-lg fw-bold py-3" onClick={confirmFinalSubmit} style={{ borderRadius: '12px' }}>Confirm Submission</button>
                            <button className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;