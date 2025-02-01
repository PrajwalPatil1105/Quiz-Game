import React, { useEffect } from "react";
import styles from "../Styles/CountDown.module.css";

function CountDown({ setCountdown, countdown, gameState, setGameState }) {
  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      setCountdown("GO");
      setTimeout(() => {
        setGameState("playing");
      }, 800);
    }
  }, [countdown, gameState]);

  return (
    <div className={styles.countdown}>
      <div className={styles.countdownNumber}>{countdown}</div>
    </div>
  );
}

export default CountDown;
