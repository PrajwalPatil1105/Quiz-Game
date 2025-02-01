import React, { useState, useEffect, useRef } from "react";
import styles from "../Styles/MainPage.module.css";
import LandingPage from "./LandingPage";
import CountDown from "./CountDown";
import Error from "./Error";
import Loading from "./Loading";
import Confetti from "react-confetti";
import ConfettiExplosion from "react-confetti-explosion";

const MainPage = () => {
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

  const calculateProgress = () => {
    return ((currentQuestion + 1) / quizData.questions.length) * 100;
  };

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
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionId);

    const currentQuestionData = quizData.questions[questionIndex];
    const selectedOption = currentQuestionData.options.find(
      (opt) => opt.id === optionId
    );
    const isCorrect = selectedOption?.is_correct;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionId;
    setAnswers(newAnswers);
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

  const handleNext = async () => {
    setShowCorrectOption(false);
    if (currentQuestion < quizData.questions.length - 1) {
      setIsAnimating(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentQuestion(currentQuestion + 1);
      const nextAnswer = answers[currentQuestion + 1];
      setSelectedAnswer(nextAnswer !== null ? nextAnswer : null);
      setIsAnimating(false);
    } else {
      setGameState("finished");
      setPageState("results");
    }
  };

  const handlePrevious = async () => {
    setShowCorrectOption(false);
    if (currentQuestion > 0) {
      setIsAnimating(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers[currentQuestion - 1];
      setSelectedAnswer(previousAnswer !== null ? previousAnswer : null);
      setIsAnimating(false);
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

  if (loading) {
    return <Loading />;
  }

  if (pageState === "landing") {
    return (
      <LandingPage setPageState={setPageState} setGameState={setGameState} />
    );
  }

  if (error) {
    return <Error />;
  }

  if (gameState === "countdown") {
    return (
      <CountDown
        setCountdown={setCountdown}
        countdown={countdown}
        gameState={gameState}
        setGameState={setGameState}
      />
    );
  }

  if (!quizData) {
    return null;
  }

  if (gameState === "finished") {
    const LastAudio = new Audio("./Cupwin.mp3");
    LastAudio.play();
  }

  const currentQuestionData = quizData.questions[currentQuestion];
  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
      {showCelebration && (
        <>
          <Confetti recycle={false} numberOfPieces={800} gravity={0.4} />{" "}
        </>
      )}
      <div className={styles.header}>
        <h2>
          {quizData.title}
          <div className={styles.topic}> Topic: {quizData.topic}</div>
        </h2>
        <div className={`${styles.timer} ${styles.animatedTimer}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      {badge && <div className={styles.badge}>{badge}</div>}
      <div
        className={`${styles.questionContainer} ${
          isAnimating ? styles.slideOut : styles.slideIn
        }`}
      >
        <div className={styles.questionNumber}>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </div>
        <div className={styles.question}>{currentQuestionData.description}</div>

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

      {gameState === "finished" && (
        <div className={styles.resultOverlay}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 1010,
            }}
          >
            <ConfettiExplosion
              width={window.innerWidth / 2}
              height={window.innerHeight}
              numberOfPieces={1500}
              recycle={false}
              gravity={0.3}
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 1010,
            }}
          >
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
