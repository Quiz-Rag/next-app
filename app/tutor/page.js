"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  startChatSession, 
  getChatHistory, 
  getChatSessionInfo,
  endChatSession 
} from '@/lib/api';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from './ChatTutor.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatTutorPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const tokenBufferRef = useRef('');
  const bufferTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Initialize chat session
  useEffect(() => {
    initializeChat();
  }, []);

  // Load session info periodically
  useEffect(() => {
    if (!sessionId) return;
    
    const interval = setInterval(async () => {
      try {
        const info = await getChatSessionInfo(sessionId);
        setSessionInfo(info);
      } catch (err) {
        // Session might be expired
        console.error('Failed to fetch session info:', err);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  async function initializeChat() {
    setIsLoading(true);
    setError(null);

    try {
      // Check for existing session in localStorage
      const savedSessionId = localStorage.getItem('chatSessionId');
      
      if (savedSessionId) {
        // Try to validate and load existing session
        try {
          const info = await getChatSessionInfo(savedSessionId);
          
          if (info.is_active) {
            // Session is valid, load history
            setSessionId(savedSessionId);
            setSessionInfo(info);
            
            const history = await getChatHistory(savedSessionId);
            setMessages(history.messages);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          // Session not found or invalid, start new
          localStorage.removeItem('chatSessionId');
        }
      }

      // Start new session
      await startNewSession();
    } catch (err) {
      setError(err.message || 'Failed to initialize chat');
      setIsLoading(false);
    }
  }

  async function startNewSession() {
    try {
      const response = await startChatSession({ user_name: 'Student' });
      
      setSessionId(response.session_id);
      localStorage.setItem('chatSessionId', response.session_id);
      
      setMessages([{
        role: 'assistant',
        content: response.greeting,
        created_at: response.started_at,
      }]);

      // Fetch session info
      const info = await getChatSessionInfo(response.session_id);
      setSessionInfo(info);
      
      setIsLoading(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to start chat session');
    }
  }

  async function handleSendMessage() {
    if (!inputText.trim() || isStreaming || !sessionId) return;

    const userMessage = inputText.trim();
    setInputText('');
    setError(null);

    // Add user message
    const userMsg = {
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Check message limit
    if (sessionInfo && sessionInfo.message_count >= 49) {
      setError('You have reached the 50 message limit for this session. Please start a new chat.');
      return;
    }

    setIsStreaming(true);
    setCurrentResponse('');
    tokenBufferRef.current = '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === 'token') {
                fullResponse += data.content;
                bufferToken(data.content);
              } else if (data.type === 'done') {
                // Flush any remaining buffered tokens
                flushTokenBuffer();
                
                // Add complete message
                const assistantMsg = {
                  role: 'assistant',
                  content: fullResponse,
                  created_at: new Date().toISOString(),
                  tokens_used: data.tokens_used,
                };
                setMessages(prev => [...prev, assistantMsg]);
                setCurrentResponse('');
                
                // Update session info
                if (sessionInfo) {
                  setSessionInfo({
                    ...sessionInfo,
                    message_count: sessionInfo.message_count + 2, // user + assistant
                  });
                }
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setCurrentResponse('');
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsStreaming(false);
    }
  }

  function bufferToken(token) {
    tokenBufferRef.current += token;
    
    clearTimeout(bufferTimeoutRef.current);
    bufferTimeoutRef.current = setTimeout(() => {
      flushTokenBuffer();
    }, 30); // Update UI every 30ms
  }

  function flushTokenBuffer() {
    if (tokenBufferRef.current) {
      setCurrentResponse(prev => prev + tokenBufferRef.current);
      tokenBufferRef.current = '';
    }
  }

  async function handleNewChat() {
    if (isStreaming) return;
    
    const confirmed = confirm('Start a new conversation? Current chat will be saved.');
    if (!confirmed) return;

    setIsLoading(true);
    await startNewSession();
  }

  async function handleEndChat() {
    if (isStreaming) return;
    
    const confirmed = confirm('End this chat session?');
    if (!confirmed) return;

    try {
      if (sessionId) {
        await endChatSession(sessionId);
        localStorage.removeItem('chatSessionId');
      }
      setSessionId(null);
      setMessages([]);
      setSessionInfo(null);
      await startNewSession();
    } catch (err) {
      setError('Failed to end session');
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 size={48} className={styles.spinner} />
          <p>Initializing chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ChatHeader
          messageCount={sessionInfo?.message_count || 0}
          onNewChat={handleNewChat}
          onEndChat={handleEndChat}
        />

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className={styles.errorClose}>
              ×
            </button>
          </div>
        )}

        <div className={styles.messagesContainer}>
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
                timestamp={msg.created_at}
              />
            ))}

            {currentResponse && (
              <ChatMessage
                role="assistant"
                content={currentResponse}
                isStreaming={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={styles.inputContainer}>
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSubmit={handleSendMessage}
            disabled={isStreaming || (sessionInfo?.message_count >= 50)}
            maxLength={500}
          />
        </div>
      </div>
    </div>
  );
}
