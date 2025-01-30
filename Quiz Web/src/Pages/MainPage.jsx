import React, { useState, useEffect } from "react";
import styles from "./MainPage.module.css";

const MainPage = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameState, setGameState] = useState("loading");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch("https://api.jsonserve.com/Uw5CrX");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuizData(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setTimeLeft(data.duration * 60);
        setGameState("countdown");
      } catch (err) {
        setError(err.message);
        setGameState("error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      setGameState("playing");
    }
  }, [countdown, gameState]);

  // Handle game timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleAnswerSelect = (questionIndex, optionId) => {
    if (gameState !== "playing") return;

    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionId;
    setAnswers(newAnswers);

    const currentQuestionData = quizData.questions[questionIndex];
    const isCorrect = currentQuestionData.options.find(
      (opt) => opt.id === optionId
    )?.is_correct;

    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    } else {
      const answerElement = document.querySelector(`.${styles.selectedWrong}`);
      answerElement?.classList.add(styles.shake);
      setTimeout(() => {
        answerElement?.classList.remove(styles.shake);
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((answerId, index) => {
      const question = quizData.questions[index];
      const isCorrect = question.options.find(
        (opt) => opt.id === answerId
      )?.is_correct;
      if (isCorrect) score += parseFloat(quizData.correct_answer_marks);
      else if (answerId !== null) score -= parseFloat(quizData.negative_marks);
    });
    return score;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading Quiz...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Quiz</h2>
        <p>{error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Countdown state
  if (gameState === "countdown") {
    return (
      <div className={styles.countdown}>
        <div className={styles.countdownNumber}>{countdown}</div>
      </div>
    );
  }

  // No quiz data
  if (!quizData) {
    return null;
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className={styles.container}>
      {showCelebration && (
        <div className={styles.celebration}>✨ Correct! ✨</div>
      )}

      <div className={styles.header}>
        <h2>{quizData.title}</h2>
        <div className={styles.timer}>{formatTime(timeLeft)}</div>
      </div>

      <div className={styles.questionContainer}>
        <div className={styles.questionNumber}>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </div>
        <div className={styles.question}>{currentQuestionData.description}</div>

        <div className={styles.optionsContainer}>
          {currentQuestionData.options.map((option) => (
            <div
              key={option.id}
              className={`${styles.option} ${
                answers[currentQuestion] === option.id
                  ? option.is_correct
                    ? styles.selectedCorrect
                    : styles.selectedWrong
                  : ""
              }`}
              onClick={() => handleAnswerSelect(currentQuestion, option.id)}
            >
              {option.description}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={currentQuestion === quizData.questions.length - 1}
        >
          Next
        </button>
      </div>

      {gameState === "finished" && (
        <div className={styles.resultOverlay}>
          <div className={styles.resultCard}>
            <h2>Quiz Completed!</h2>
            <p>Your Score: {calculateScore()}</p>
            <p>Time Taken: {quizData.duration * 60 - timeLeft} seconds</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
