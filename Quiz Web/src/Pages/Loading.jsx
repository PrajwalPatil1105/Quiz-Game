import React from "react";
import styles from "../Styles/Loading.module.css";

function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading Quiz...</p>
    </div>
  );
}

export default Loading;
