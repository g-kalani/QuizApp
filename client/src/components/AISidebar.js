import React from 'react';

const AISidebar = ({ show, onClose, data, loading }) => {
    return (
        <div className={`offcanvas offcanvas-end ${show ? 'show' : ''}`} 
             style={{ visibility: show ? 'visible' : 'hidden', transition: '0.3s' }}
             tabIndex="-1">
            <div className="offcanvas-header bg-primary text-white">
                <h5 className="offcanvas-title">✨ AI Tutor Explanation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="offcanvas-body">
                {loading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Thinking...</p>
                    </div>
                ) : (
                    <>
                        <h6 className="fw-bold">Question:</h6>
                        <p dangerouslySetInnerHTML={{ __html: data.question }}></p>
                        <hr />
                        <h6 className="fw-bold text-success">Correct Answer:</h6>
                        <p dangerouslySetInnerHTML={{ __html: data.correct }}></p>
                        <hr />
                        <h6 className="fw-bold text-primary">AI Explanation:</h6>
                        <p>{data.explanation}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AISidebar;