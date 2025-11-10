"use client";

import React from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import styles from './ChatMessage.module.css';
import { useState } from 'react';

export default function ChatMessage({ role, content, timestamp, isStreaming = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${styles.messageWrapper} ${role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.messageContainer}>
        <div className={styles.avatar}>
          {role === 'user' ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        <div className={styles.messageContent}>
          <div className={styles.messageHeader}>
            <span className={styles.roleName}>
              {role === 'user' ? 'You' : 'AI Tutor'}
            </span>
            {timestamp && (
              <span className={styles.timestamp}>
                {formatTime(timestamp)}
              </span>
            )}
          </div>
          
          <div className={styles.messageBubble}>
            <p className={styles.messageText}>
              {content}
              {isStreaming && <span className={styles.cursor}>▋</span>}
            </p>
          </div>

          {role === 'assistant' && !isStreaming && content && (
            <button
              onClick={handleCopy}
              className={styles.copyButton}
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
