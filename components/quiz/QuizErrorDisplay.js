"use client";

import React from 'react';
import { AlertCircle, Upload, BookOpen, Info, AlertTriangle } from 'lucide-react';
import styles from './QuizErrorDisplay.module.css';

export default function QuizErrorDisplay({ error, onRetry, onUploadDocs }) {
  if (!error) return null;

  // Out of Scope Error
  if (error.type === 'out_of_scope') {
    return (
      <div className={styles.errorContainer}>
        <div className={`${styles.errorBox} ${styles.errorWarning}`}>
          <div className={styles.errorHeader}>
            <AlertTriangle size={24} className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>Topic Outside Network Security Domain</h3>
          </div>
          <p className={styles.errorMessage}>{error.message}</p>
          <p className={styles.errorHint}>
            Please try topics related to Network Security such as encryption, firewalls, authentication, 
            SQL injection, XSS, intrusion detection, or secure coding practices.
          </p>
          <button onClick={onRetry} className={styles.retryButton}>
            Try Different Topic
          </button>
        </div>
      </div>
    );
  }

  // Insufficient Content Error
  if (error.type === 'insufficient_content') {
    // Extract document counts from error message
    const foundMatch = error.message.match(/Found (\d+) relevant/);
    const neededMatch = error.message.match(/need at least (\d+)/);
    const found = foundMatch ? parseInt(foundMatch[1]) : 0;
    const needed = neededMatch ? parseInt(neededMatch[1]) : 3;
    const percentage = (found / needed) * 100;

    return (
      <div className={styles.errorContainer}>
        <div className={`${styles.errorBox} ${styles.errorInfo}`}>
          <div className={styles.errorHeader}>
            <BookOpen size={24} className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>Not Enough Course Material</h3>
          </div>
          <p className={styles.errorMessage}>{error.message}</p>
          
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Documents Available:</span>
              <span className={styles.progressValue}>{found} / {needed}</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={onUploadDocs} className={styles.primaryButton}>
              <Upload size={18} />
              Upload More Documents
            </button>
            <button onClick={onRetry} className={styles.secondaryButton}>
              Try Different Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No Content Error
  if (error.type === 'no_content') {
    return (
      <div className={styles.errorContainer}>
        <div className={`${styles.errorBox} ${styles.errorWarning}`}>
          <div className={styles.errorHeader}>
            <Upload size={24} className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>No Course Material Available</h3>
          </div>
          <p className={styles.errorMessage}>{error.message}</p>
          <p className={styles.errorHint}>
            Upload relevant course documents first, or try a different topic that has existing material.
          </p>
          <div className={styles.buttonGroup}>
            <button onClick={onUploadDocs} className={styles.primaryButton}>
              <Upload size={18} />
              Upload Documents
            </button>
            <button onClick={onRetry} className={styles.secondaryButton}>
              Try Different Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid Input Error
  if (error.type === 'invalid_input') {
    return (
      <div className={styles.errorContainer}>
        <div className={`${styles.errorBox} ${styles.errorDanger}`}>
          <div className={styles.errorHeader}>
            <Info size={24} className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>Invalid Quiz Description</h3>
          </div>
          <p className={styles.errorMessage}>{error.message}</p>
          
          <div className={styles.examplesBox}>
            <p className={styles.examplesTitle}>Try descriptions like:</p>
            <ul className={styles.examplesList}>
              <li>&ldquo;10 questions about encryption and RSA algorithm with 7 MCQs and 3 descriptive&rdquo;</li>
              <li>&ldquo;Quiz on SQL injection with 5 multiple choice questions&rdquo;</li>
              <li>&ldquo;8 questions covering firewalls and network security - 6 MCQs, 2 fill in the blanks&rdquo;</li>
            </ul>
          </div>

          <button onClick={onRetry} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Generic Server Error
  return (
    <div className={styles.errorContainer}>
      <div className={`${styles.errorBox} ${styles.errorDanger}`}>
        <div className={styles.errorHeader}>
          <AlertCircle size={24} className={styles.errorIcon} />
          <h3 className={styles.errorTitle}>Something Went Wrong</h3>
        </div>
        <p className={styles.errorMessage}>{error.message}</p>
        <button onClick={onRetry} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    </div>
  );
}
