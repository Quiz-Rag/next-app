"use client";

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import styles from './ChatInput.module.css';

export default function ChatInput({ value, onChange, onSubmit, disabled, maxLength = 500 }) {
  const charCount = value.length;
  const isValid = charCount >= 3 && charCount <= maxLength;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about Network Security topics... (Shift + Enter for new line)"
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className={styles.textarea}
        />
        
        <div className={styles.footer}>
          <span className={`${styles.charCount} ${!isValid && charCount > 0 ? styles.invalid : ''}`}>
            {charCount} / {maxLength}
            {charCount > 0 && charCount < 3 && <span className={styles.hint}> (min 3)</span>}
          </span>
          
          <button
            onClick={onSubmit}
            disabled={disabled || !isValid}
            className={styles.sendButton}
            title="Send message (Enter)"
          >
            {disabled ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
