import React from "react";
import styles from "../Styles/Error.module.css";

function Error() {
  return (
    <div className={styles.errorContainer}>
      <h2>Error Loading Quiz</h2>
      <p>Please Try Again</p>
      <button
        className={styles.retryButton}
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

export default Error;
