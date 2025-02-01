import React from "react";
import styles from "../Styles/LandingPage.module.css";

function LandingPage({ setPageState, setGameState }) {
  return (
    <div className={styles.landingPage}>
      <img src="./Logo1.png" alt="TestLine Logo" className={styles.logo} />
      <h1 className={styles.companyName}>Welcome to TestLine</h1>
      <p className={styles.introText}>
        At TestLine, we are committed to providing the best online testing
        experience. Explore our platform and challenge yourself with our quizzes
        designed to enhance your knowledge and skills.
      </p>
      <button
        className={styles.startButton}
        onClick={() => {
          setPageState("quiz");
          setGameState("countdown");
        }}
      >
        Start Quiz
      </button>
    </div>
  );
}

export default LandingPage;
