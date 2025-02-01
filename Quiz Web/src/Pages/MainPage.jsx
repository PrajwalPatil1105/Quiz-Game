import React, { useState, useEffect } from "react";
import styles from "../Styles/MainPage.module.css";
import LandingPage from "./LandingPage";
import CountDown from "./CountDown";
import Error from "./Error";
import Loading from "./Loading";
import Confetti from "react-confetti";
import ConfettiExplosion from "react-confetti-explosion";

const MainPage = () => {
  // State variables
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pageState, setPageState] = useState("landing");
  const [gameState, setGameState] = useState("loading");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const [badge, setBadge] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [correctAnswerData, setCorrectAnswerData] = useState(null);
  const [showCorrectOption, setShowCorrectOption] = useState(false);

  // Calculate progress percentage
  const calculateProgress = () => {
    return ((currentQuestion + 1) / quizData.questions.length) * 100;
  };

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch("/generated.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuizData(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setTimeLeft(data.duration * 60);
      } catch (err) {
        setError(err.message);
        setGameState("error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Countdown timer for the quiz
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
  }, [gameState, timeLeft]);

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, optionId) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionId);

    const currentQuestionData = quizData.questions[questionIndex];
    const selectedOption = currentQuestionData.options.find(
      (opt) => opt.id === optionId
    );
    const isCorrect = selectedOption?.is_correct;

    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = optionId;
    setAnswers(updatedAnswers);

    if (isCorrect) {
      const winAudio = new Audio("./Win.mp3");
      winAudio.play();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      const newScore =
        calculateScore() + parseFloat(quizData.correct_answer_marks);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    } else {
      const loseAudio = new Audio("./lose.mp3");
      loseAudio.play();
      setShowCorrectOption(true);
      const correctOption = currentQuestionData.options.find(
        (opt) => opt.is_correct
      );
      setCorrectAnswerData({
        correct: correctOption?.description,
        selected: selectedOption?.description,
      });
    }
  };

  // Navigate to the next question
  const handleNext = async () => {
    setShowCorrectOption(false);
    if (currentQuestion < quizData.questions.length - 1) {
      setIsAnimating(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || null);
      setIsAnimating(false);
    } else {
      setGameState("finished");
      setPageState("results");
    }
  };

  // Navigate to the previous question
  const handlePrevious = async () => {
    setShowCorrectOption(false);
    if (currentQuestion > 0) {
      setIsAnimating(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentQuestion((prev) => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
      setIsAnimating(false);
    }
  };

  // Calculate total score
  const calculateScore = () => {
    return answers.reduce((score, answerId, index) => {
      const question = quizData.questions[index];
      const isCorrect = question.options.find(
        (opt) => opt.id === answerId
      )?.is_correct;
      if (isCorrect) {
        return score + parseFloat(quizData.correct_answer_marks);
      } else if (answerId !== null) {
        return score - parseFloat(quizData.negative_marks);
      }
      return score;
    }, 0);
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render components based on the current state
  if (loading) return <Loading />;
  if (pageState === "landing")
    return (
      <LandingPage setPageState={setPageState} setGameState={setGameState} />
    );
  if (error) return <Error />;
  if (gameState === "countdown")
    return (
      <CountDown
        countdown={countdown}
        setCountdown={setCountdown}
        setGameState={setGameState}
      />
    );
  if (!quizData) return null;

  if (gameState === "finished") {
    const LastAudio = new Audio("./Cupwin.mp3");
    LastAudio.play();
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>

      {/* Celebration Confetti */}
      {showCelebration && (
        <Confetti recycle={false} numberOfPieces={800} gravity={0.4} />
      )}

      {/* Quiz Header */}
      <div className={styles.header}>
        <h2>
          {quizData.title}
          <div className={styles.topic}>Topic: {quizData.topic}</div>
        </h2>
        <div className={`${styles.timer} ${styles.animatedTimer}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Badge */}
      {badge && <div className={styles.badge}>{badge}</div>}

      {/* Question Container */}
      <div
        className={`${styles.questionContainer} ${
          isAnimating ? styles.slideOut : styles.slideIn
        }`}
      >
        <div className={styles.questionNumber}>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </div>
        <div className={styles.question}>{currentQuestionData.description}</div>

        {/* Options */}
        <div className={styles.optionsContainer}>
          {currentQuestionData.options.map((option) => (
            <div
              key={option.id}
              className={`${styles.option} ${
                selectedAnswer === option.id
                  ? option.is_correct
                    ? styles.selectedCorrect
                    : styles.selectedWrong
                  : ""
              } ${
                showCorrectOption && option.is_correct
                  ? styles.correctAnswer
                  : ""
              }`}
              onClick={() => handleAnswerSelect(currentQuestion, option.id)}
            >
              {option.description}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || isAnimating}
        >
          Previous
        </button>
        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={isAnimating}
        >
          {currentQuestion === quizData.questions.length - 1
            ? "Finish"
            : "Next"}
        </button>
      </div>

      {/* Result Overlay */}
      {gameState === "finished" && (
        <div className={styles.resultOverlay}>
          {/* Confetti Explosions */}
          <div className={styles.confettiLeft}>
            <ConfettiExplosion
              width={window.innerWidth / 2}
              height={window.innerHeight}
              numberOfPieces={1500}
              recycle={false}
              gravity={0.3}
            />
          </div>
          <div className={styles.confettiRight}>
            <ConfettiExplosion
              width={window.innerWidth / 2}
              height={window.innerHeight}
              numberOfPieces={500}
              recycle={false}
              gravity={0.3}
            />
          </div>
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
