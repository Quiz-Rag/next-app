"use client";

import React from 'react';
import { Bot, MessageSquare, RefreshCw, X } from 'lucide-react';
import styles from './ChatHeader.module.css';

export default function ChatHeader({ messageCount = 0, onNewChat, onEndChat }) {
  const isNearLimit = messageCount >= 45;
  const isAtLimit = messageCount >= 50;

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.icon}>
          <Bot size={32} />
        </div>
        <div>
          <h1 className={styles.title}>Network Security Tutor</h1>
          <p className={styles.subtitle}>Ask me anything about Network Security</p>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={`${styles.badge} ${isNearLimit ? styles.badgeWarning : ''} ${isAtLimit ? styles.badgeDanger : ''}`}>
          <MessageSquare size={16} />
          <span>{messageCount} / 50</span>
        </div>

        <button
          onClick={onNewChat}
          className={styles.button}
          title="Start new conversation"
        >
          <RefreshCw size={18} />
          <span>New Chat</span>
        </button>

        <button
          onClick={onEndChat}
          className={`${styles.button} ${styles.buttonDanger}`}
          title="End current session"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
