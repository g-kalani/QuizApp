# QuizMaster Assessment Portal
A robust React-based quiz application built as part of the Software Engineer Intern evaluation for **CausalFunnel**. This application allows users to take a 15-question assessment with real-time tracking, persistent state management, and detailed performance reporting.

**Live Demo:** [Insert Link Here]

---

## 📝 Application Overview
The application follows the specific workflow:

1.  **Start Page**: Users register by submitting their email address to initialize the session.
2.  **Quiz Interface**: 
    * Displays **15 questions** fetched dynamically from the OpenTDB API.
    * Features a **30-minute countdown timer** at the top of the page.
    * Implements **Auto-Submit** logic when the timer reaches zero.
3.  **Navigation & Overview**:
    * A side panel allows users to jump to specific questions.
    * Visual indicators track **Visited** (cyan border), **Attempted** (green background), and **Marked for Review** (yellow corner ribbon).
4.  **Report Page**: A final breakdown showing each question with the user's answer and the correct answer side-by-side for comparison along with a AI Tutor "explain" option.

---

## 🏗️ Technical Architecture

### 🛠️ Tech Stack

* **Core Framework**: `React.js`
* **AI Engine**: `Gemini API` (for AI tutoring and explanation features)
* **Routing**: `React Router Dom`
* **API Handling**: `Axios` (for OpenTDB question fetching and Gemini integration)
* **Styling**: `Bootstrap 5` & `Custom CSS`
* **State Management**: `React Hooks` (useState, useEffect, useRef)
* **Data Persistence**: `Web Storage API` (localStorage)
* **Notifications**: `React Hot Toast`

### Component Breakdown
* `StartPage`: Manages user entry and email validation.
* `QuizPage`: The core engine managing the 30-minute timer, question state, and auto-submit logic.
* `NavigationGrid`: A responsive sidebar that provides an overview of question statuses.
* `ReportPage`: Aggregates and displays final performance data[cite: 20].

**Source**: Questions are fetched from the OpenTDB API using the `question`, `correct_answer`, and `incorrect_answers` parameters.

---

## ⚙️ Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone [your-repository-url]
    cd quiz-application
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the application**:
    ```bash
    npm start
    ```
    The portal will be accessible at `http://localhost:3000`.

---

## 💡 Assumptions Made
* **Refresh Persistence**: Assumed users might refresh or close the page during the 30-minute window; therefore, `localStorage` is used to sync `timeLeft`, `answers`, and `visited` status.
* **Question Format**: Assumed "Multiple Choice" format based on the API parameters provided.

---

## 🧠 Challenges & Solutions
* **Challenge: Multi-State Indicators**: Displaying if a question was both "Answered" and "Marked for Review" without cluttering the UI.
    * **Solution**: Implemented an absolute-positioned "Corner Ribbon" (triangle). This allows the green "Answered" background and the yellow "Marked" indicator to coexist without overlapping the question number.
* **Secure Session Termination**: Managing sensitive API tokens while preventing users from returning to the quiz once the report is generated. 
    * **Solution**: Developed a selective cleanup process. Upon submission, the application clears all quiz-specific data (answers, timer, and visited status) from `localStorage` to prevent back-navigation, while strategically retaining the Gemini API token to ensure AI tutoring remains functional on the Report Page. 
* **Challenge: Auto-Submission Reliability**: Ensuring the quiz submits even if a user is in a different tab or the modal is open.
    * **Solution**: The timer logic triggers the `confirmFinalSubmit` function directly when `timeLeft === 0`, bypassing all UI prompts to ensure compliance with the zero-timer requirement.

---

## ✨ Bonus Features
* **AI Tutor**: Intergrated gemini API to explain the questions and their answers to the users.
* **Custom Submit Modal**: Replaced browser alerts with a clean UI summary modal.
* **Toast Notifications**: Real-time alerts at the 15-minute and 1-minute marks.
* **Deselect Capability**: Users can unclick an answer to clear their choice.
