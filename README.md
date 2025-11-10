# 🎮 NetSec Arcade - Interactive Network Security Learning Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An AI-powered, gamified learning platform for mastering Network Security concepts through interactive quizzes, real-time packet analysis, and intelligent tutoring.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Architecture](#-system-architecture)

</div>

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Demo Video](#-demo-video)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Training Data](#-training-data)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Description

**NetSec Arcade** is a comprehensive, interactive learning platform designed to make Network Security education engaging and effective. Built with modern web technologies and AI capabilities, it combines gamification, real-time feedback, and intelligent tutoring to create an immersive learning experience.

### 🎯 Key Objectives

- **Gamified Learning**: Transform complex security concepts into engaging, game-like quizzes
- **AI-Powered Generation**: Automatically generate contextual quizzes from course materials
- **Real-Time Analysis**: Integrate Wireshark for live network packet capture and analysis
- **Intelligent Tutoring**: Provide 24/7 AI tutor support with RAG-based responses
- **Adaptive Learning**: Track progress and adjust difficulty based on performance

### 👥 Target Audience

- Computer Science students studying Network Security
- Cybersecurity professionals seeking to refresh knowledge
- Self-learners exploring network security concepts
- Educators looking for interactive teaching tools

---

## ✨ Features

### 🎲 AI Quiz Generator
- **Natural Language Input**: Describe quizzes in plain English
- **Smart Generation**: AI creates contextual questions from uploaded course materials
- **Multiple Question Types**: MCQ, Fill-in-the-blanks, Descriptive questions
- **Three Difficulty Levels**: Easy, Medium, Hard
- **Auto-Grading**: Instant feedback with detailed explanations
- **History Tracking**: View past attempts and analyze performance
- **Error Handling**: User-friendly messages for out-of-scope topics and insufficient data

### 📚 Document Training System
- **Batch Upload**: Upload 1-30 PDF/PPTX files simultaneously
- **Smart Processing**: Automatic text extraction and chunking
- **Vector Embeddings**: Create searchable embeddings using sentence-transformers
- **Progress Tracking**: Real-time progress bars for each file
- **ChromaDB Storage**: Persistent vector database for fast retrieval
- **Error Recovery**: Handles partial failures gracefully

### 🤖 AI Tutor (Chat Interface)
- **Real-Time Streaming**: SSE-based token streaming for natural conversation
- **Session Management**: Persistent chat sessions with localStorage
- **Context-Aware**: Uses RAG to answer from course materials
- **Message Limits**: 50 messages per session with clear warnings
- **Conversation History**: Load previous chats on page refresh
- **Domain Restriction**: Focused only on Network Security topics

### 🔍 Wireshark Integration
- **Live Packet Capture**: Capture network traffic in real-time
- **Filter Support**: Apply BPF filters for targeted capture
- **Analysis Tools**: Built-in packet inspection and statistics
- **Export Options**: Download captures as .pcapng files
- **Visual Interface**: User-friendly UI for network analysis

### 📊 Analytics & Tracking
- **Quiz Analytics**: Track attempts, scores, and time taken
- **User Progress**: Monitor improvement over time
- **Leaderboards**: Compare performance (coming soon)
- **Telemetry**: Anonymous usage tracking for platform improvement

---

## 🎥 Demo Video

<div align="center">

### 📹 [**Watch Full Demo Video**](https://drive.google.com/file/d/1oJInVJYRmZST9lXC0clNR8nic8Vjw3nO/view?usp=sharing)

[![NetSec Arcade Demo](https://img.shields.io/badge/▶️_Watch_Demo-4285F4?style=for-the-badge&logo=google-drive&logoColor=white)](https://drive.google.com/file/d/1oJInVJYRmZST9lXC0clNR8nic8Vjw3nO/view?usp=sharing)

</div>

**Video Overview:**
- 📚 Complete platform walkthrough
- 🎮 AI-powered quiz generation in action
- 📤 Document upload and training process
- 💬 Interactive AI tutor demonstration
- 📊 Real-time grading and analytics
- 🔍 Wireshark packet capture integration

> **Note**: Click the badge above or [this link](https://drive.google.com/file/d/1oJInVJYRmZST9lXC0clNR8nic8Vjw3nO/view?usp=sharing) to watch the full demonstration on Google Drive.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Quiz   │  │  Tutor   │  │Train DB  │  │Wireshark │       │
│  │  Module  │  │  Chat    │  │ Upload   │  │ Capture  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        │ HTTP/REST   │ SSE Stream  │ FormData    │ HTTP
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────────┐
│                    Backend (FastAPI)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Quiz API    │  │   Chat API   │  │  Upload API  │          │
│  │  /api/quiz/* │  │  /api/chat/* │  │/api/start-*  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │              Core Services Layer                    │          │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │          │
│  │  │ OpenAI LLM  │  │ RAG Pipeline │  │Embedding │ │          │
│  │  │ (GPT-4)     │  │ (ChromaDB)   │  │Generator │ │          │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │          │
│  └──────────────────────────────────────────────────┘          │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Data Layer          │
                    │  ┌────────────────┐  │
                    │  │  SQLite DB     │  │
                    │  │  (Metadata)    │  │
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │  ChromaDB      │  │
                    │  │  (Vectors)     │  │
                    │  └────────────────┘  │
                    │  ┌────────────────┐  │
                    │  │  File System   │  │
                    │  │  (.pcap files) │  │
                    │  └────────────────┘  │
                    └─────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **UI Library**: React 19
- **Styling**: CSS Modules + Custom Design Tokens
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router

#### Backend
- **Framework**: FastAPI 0.104+
- **AI/ML**: 
  - OpenAI GPT-4 (Quiz generation, Chat responses)
  - sentence-transformers (Text embeddings)
- **Vector Database**: ChromaDB 0.4+
- **Database**: SQLite (Metadata storage)
- **Document Processing**: 
  - PyPDF2 (PDF extraction)
  - python-pptx (PPTX extraction)
- **Network Capture**: 
  - dumpcap (Wireshark CLI)
  - pyshark (Packet analysis)

#### Infrastructure
- **Development**: Node.js 18+, Python 3.9+
- **Package Managers**: npm, pip
- **Environment**: dotenv for configuration
- **CORS**: Enabled for local development

---

## 📦 Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Required for AI features

### Software Requirements

#### Required
1. **Node.js** (v18.0.0 or higher)
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **Python** (v3.9 or higher)
   ```bash
   python --version  # Should be >= 3.9
   ```

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

4. **pip** (comes with Python)
   ```bash
   pip --version
   ```

#### Optional (for full features)
5. **Wireshark CLI** (for packet capture)
   - macOS: `brew install --cask wireshark`
   - Ubuntu: `sudo apt install wireshark tshark`
   - Windows: Download from [wireshark.org](https://www.wireshark.org/)

### API Keys Required

1. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com/)
   - Used for quiz generation and AI tutor
   - Requires GPT-4 access

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Quiz-Rag/next-app.git

# Navigate to project directory
cd next-app
```

### Step 2: Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory (if separate)
# Or clone the backend repository
git clone https://github.com/your-org/backend-repo.git
cd backend-repo

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your OpenAI API key:
OPENAI_API_KEY=sk-your-api-key-here
```

### Step 4: Wireshark Setup (Optional)

#### macOS
```bash
# Install Wireshark
brew install --cask wireshark

# Add user to access_bpf group (already done during install)
# Verify dumpcap is accessible
dumpcap --version

# Test capture permissions
dumpcap -D
```

#### Ubuntu/Linux
```bash
# Install Wireshark
sudo apt update
sudo apt install -y wireshark tshark

# Configure for non-root capture
sudo dpkg-reconfigure wireshark-common  # Select "Yes"

# Add user to wireshark group
sudo usermod -aG wireshark $USER

# Log out and log back in, then verify
dumpcap -D
```

#### Windows
1. Download Wireshark installer from [wireshark.org](https://www.wireshark.org/download.html)
2. During installation:
   - Check "Install Npcap"
   - Check "Support loopback traffic" (if offered)
3. Restart your computer
4. Verify installation:
   ```cmd
   dumpcap -D
   ```

### Step 5: Initialize Databases

```bash
# Start backend server (first time)
cd backend-repo
uvicorn main:app --reload

# This will automatically create:
# - SQLite database (netsec.db)
# - ChromaDB directory (chroma_data/)
```

---

## ⚙️ Configuration

### Frontend Configuration (.env.local)

```bash
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Backend Configuration (.env)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-1106-preview

# Database Configuration
DATABASE_URL=sqlite:///./netsec.db
CHROMA_PERSIST_DIRECTORY=./chroma_data

# Embedding Model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Server Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000

# Feature Flags
ENABLE_CHAT=true
ENABLE_QUIZ_GENERATION=true
ENABLE_WIRESHARK=true

# Security
SECRET_KEY=your-secret-key-here  # Change in production
SESSION_TIMEOUT=3600

# Wireshark
DUMPCAP_PATH=/opt/homebrew/bin/dumpcap  # macOS
# DUMPCAP_PATH=/usr/bin/dumpcap  # Linux
CAPTURE_DIR=./tmp
```

---

## 📘 Usage Guide

### 1. Starting the Application

#### Terminal 1: Start Backend
```bash
cd backend-repo
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload

# Backend will start at http://localhost:8000
# API docs available at http://localhost:8000/docs
```

#### Terminal 2: Start Frontend
```bash
cd next-app
npm run dev

# Frontend will start at http://localhost:3000
```

### 2. Using the Quiz Generator

#### Step 1: Upload Course Materials (First Time)
1. Navigate to **Train DB** page
2. Click or drag-and-drop PDF/PPTX files (up to 30 files)
3. Click "Upload & Process"
4. Wait for processing to complete (shows real-time progress)
5. Files are now available for quiz generation

#### Step 2: Generate a Quiz
1. Navigate to **Quiz** → **Generate** page
2. Describe your quiz in natural language:
   ```
   Example: "Create a quiz with 10 questions about encryption algorithms 
   (RSA, AES, DES). Include 7 multiple choice and 3 descriptive questions 
   focusing on practical applications."
   ```
3. Select difficulty: Easy, Medium, or Hard
4. Click "Generate Quiz with AI"
5. Wait 10-30 seconds for AI generation

#### Step 3: Take the Quiz
1. Read each question carefully
2. For MCQs: Select one answer
3. For Fill-in-the-blanks: Type your answer
4. For Descriptive: Provide detailed explanation
5. Click "Submit Quiz" when done

#### Step 4: View Results
1. Auto-graded results appear instantly
2. See correct answers and explanations
3. Check your score breakdown by question type
4. View time taken and percentage score
5. Access quiz history anytime

### 3. Using the AI Tutor

1. Navigate to **Tutor** page
2. Chat interface loads automatically
3. Type questions about Network Security
4. AI responds with streaming text (token-by-token)
5. Responses are based on your uploaded course materials
6. Up to 50 messages per session
7. Sessions persist across page refreshes
8. Click "New Chat" to start fresh conversation

### 4. Using Wireshark Integration

1. Navigate to **Wireshark** page
2. Select network interface (e.g., lo0 for loopback)
3. Optional: Add BPF filter (e.g., `tcp port 3000`)
4. Set capture duration (default: 10 seconds)
5. Click "Start Capture"
6. Capture runs in background
7. View captured packets in table
8. Click "Download PCAP" to save file
9. Analyze in Wireshark desktop app if needed

---

## 📊 Training Data

### Supported File Formats

| Format | Extension | Max Size | Processing |
|--------|-----------|----------|------------|
| PDF | `.pdf` | 50 MB | PyPDF2 text extraction |
| PowerPoint | `.pptx` | 50 MB | python-pptx slide extraction |

### Data Processing Pipeline

```
1. File Upload
   └─> Validate format & size
       └─> Save to temp storage

2. Text Extraction
   └─> PDF: Extract all text, preserve structure
   └─> PPTX: Extract slide titles + content

3. Text Cleaning
   └─> Remove special characters
   └─> Normalize whitespace
   └─> Filter out metadata

4. Chunking
   └─> Split into 500-character chunks
   └─> Overlap: 100 characters
   └─> Preserve context at boundaries

5. Embedding Generation
   └─> Model: sentence-transformers/all-MiniLM-L6-v2
   └─> Dimension: 384
   └─> Batch size: 32

6. Vector Storage
   └─> Database: ChromaDB
   └─> Collection: Per-course or unified
   └─> Metadata: filename, page/slide number, chunk index
```

### Data Format Requirements

#### Course Materials Guidelines
- **Content**: Network Security topics (encryption, firewalls, attacks, protocols, etc.)
- **Language**: English
- **Structure**: Headings, paragraphs, bullet points
- **Quality**: Clear, technical, educational content
- **Length**: At least 3 documents for quiz generation

#### Optimal Document Structure
```markdown
# Topic Title

## Subtopic 1
Explanation text...

- Key point 1
- Key point 2

Example code or diagram description...

## Subtopic 2
More content...
```

### Training Data Storage

```
project/
├── backend/
│   ├── chroma_data/              # Vector embeddings
│   │   ├── chroma.sqlite3        # ChromaDB metadata
│   │   └── [uuid]/               # Vector data
│   │       ├── data_level0.bin
│   │       ├── header.bin
│   │       └── link_lists.bin
│   ├── uploads/                  # Temporary file storage
│   │   └── temp_[timestamp]/
│   └── netsec.db                # SQLite (quiz data, sessions)
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Quiz Endpoints

#### Generate Quiz
```http
POST /api/quiz/generate
Content-Type: application/json

{
  "quiz_description": "10 questions about encryption with 7 MCQs and 3 descriptive",
  "difficulty": "medium"
}

Response 201:
{
  "quiz_id": 1,
  "topic": "Encryption & Cryptography",
  "difficulty": "medium",
  "total_questions": 10,
  "created_at": "2025-11-10T10:30:00"
}
```

#### Get Quiz
```http
GET /api/quiz/{quiz_id}

Response 200:
{
  "quiz_id": 1,
  "topic": "Encryption",
  "questions": [...],
  // Answers excluded
}
```

#### Submit Quiz
```http
POST /api/quiz/submit
Content-Type: application/json

{
  "quiz_id": 1,
  "user_id": "user123",
  "answers": {
    "1": "A",
    "2": "symmetric encryption",
    "3": "RSA uses public/private key pairs..."
  }
}

Response 200:
{
  "attempt_id": 1,
  "mcq_score": 5,
  "blank_score": 2,
  "total_score": 7,
  "max_score": 10,
  "percentage": 70.0,
  "graded_answers": [...]
}
```

### Chat Endpoints

#### Start Chat Session
```http
POST /api/chat/start
Content-Type: application/json

{
  "user_name": "Student"
}

Response 201:
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "greeting": "Hello! I'm your Network Security tutor...",
  "started_at": "2025-11-10T10:30:00"
}
```

#### Send Message (SSE Stream)
```http
POST /api/chat/message
Content-Type: application/json

{
  "session_id": "550e8400-...",
  "message": "What is SQL injection?"
}

Response 200 (Server-Sent Events):
data: {"type": "token", "content": "SQL ", "session_id": "550e8400..."}

data: {"type": "token", "content": "injection ", "session_id": "550e8400..."}

data: {"type": "done", "session_id": "550e8400...", "tokens_used": 145}
```

#### Get Chat History
```http
GET /api/chat/{session_id}/history

Response 200:
{
  "session_id": "550e8400-...",
  "messages": [
    {
      "role": "assistant",
      "content": "Hello!",
      "created_at": "2025-11-10T10:30:00"
    },
    {
      "role": "user",
      "content": "What is encryption?",
      "created_at": "2025-11-10T10:31:00"
    }
  ],
  "message_count": 2
}
```

### Document Upload Endpoints

#### Single File Upload
```http
POST /api/start-embedding
Content-Type: multipart/form-data

file: [binary PDF/PPTX]
collection_name: "course_materials" (optional)

Response 202:
{
  "job_id": "550e8400-...",
  "file_name": "lecture_notes.pdf",
  "status": "processing"
}
```

#### Batch Upload
```http
POST /api/start-embedding-batch
Content-Type: multipart/form-data

files: [binary file 1]
files: [binary file 2]
...
collection_name: "course_materials" (optional)

Response 202:
{
  "job_id": "550e8400-...",
  "file_count": 5,
  "status": "processing"
}
```

#### Check Job Status
```http
GET /api/job-status/{job_id}

Response 200:
{
  "job_id": "550e8400-...",
  "status": "completed",
  "is_batch": true,
  "total_files": 5,
  "processed_files": 5,
  "overall_progress": 100.0,
  "metadata": {
    "successful_files": 5,
    "failed_files": 0,
    "total_chunks": 234,
    "processing_time_seconds": 45.2
  }
}
```

---

## 📁 Project Structure

```
next-app/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout with navigation
│   ├── page.js                   # Home page (redirects to quiz)
│   ├── globals.css               # Global styles & CSS variables
│   ├── api/                      # API route handlers
│   │   ├── query/                # Query endpoints
│   │   └── telemetry/            # Analytics endpoints
│   ├── quiz/                     # Quiz module
│   │   ├── page.js               # Quiz home (topic selection)
│   │   ├── [id]/                 # Dynamic quiz attempt
│   │   │   ├── page.js           # Take quiz
│   │   │   └── history/          # Quiz history
│   │   ├── attempt/[id]/         # View specific attempt
│   │   ├── generate/             # AI quiz generation
│   │   │   ├── page.js
│   │   │   └── QuizGenerate.module.css
│   │   └── results/[id]/         # Quiz results page
│   ├── train-db/                 # Document upload & training
│   │   └── page.js
│   ├── tutor/                    # AI Chat Tutor
│   │   ├── page.js
│   │   └── ChatTutor.module.css
│   └── wireshark/                # Packet capture interface
│       └── page.tsx
│
├── components/                   # Reusable React components
│   ├── Navigation.js             # Top navigation bar
│   ├── Navigation.module.css
│   ├── UnderDevelopment.js       # Placeholder component
│   ├── chat/                     # Chat components
│   │   ├── ChatHeader.js         # Chat header with session info
│   │   ├── ChatMessage.js        # Individual message bubble
│   │   ├── ChatInput.js          # Message input form
│   │   └── *.module.css          # Component styles
│   └── quiz/                     # Quiz components
│       ├── QuizSetup.js          # Quiz configuration
│       ├── QuizLoading.js        # Loading animation
│       ├── QuizPlay.js           # Question display
│       ├── QuizGrading.js        # Grading animation
│       ├── QuizResults.js        # Results display
│       ├── QuizErrorDisplay.js   # Error handling UI
│       └── *.module.css          # Component styles
│
├── lib/                          # Utility functions & API client
│   ├── api.ts                    # API client functions
│   ├── capture.js                # Wireshark capture logic
│   ├── embeddingUtils.js         # Embedding utilities
│   ├── knowledgeBase.js          # RAG utilities
│   └── quizData.js               # Quiz data management
│
├── data/                         # Static JSON data
│   ├── quiz-questions.json       # Sample quiz questions
│   └── quiz-topics.json          # Quiz topics list
│
├── public/                       # Static assets
│   ├── favicon.ico
│   └── images/
│
├── contexts/                     # React Context providers
│   └── ThemeContext.js           # Theme management
│
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example environment file
├── .gitignore                    # Git ignore rules
├── jsconfig.json                 # JavaScript configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies & scripts
├── README.md                     # This file
└── SETUP_COMPLETE.md             # Setup completion checklist
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend (in backend directory)
uvicorn main:app --reload           # Start with auto-reload
uvicorn main:app --host 0.0.0.0    # Expose to network
pytest                              # Run tests
```

### Code Style Guidelines

#### Frontend
- Use functional components with hooks
- CSS Modules for component styling
- No inline styles except dynamic values
- Use semantic HTML
- Implement loading states
- Handle errors gracefully

#### Backend
- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings
- Handle exceptions properly
- Log important events

### Adding New Features

#### 1. New Quiz Question Type
1. Update `lib/api.ts` types
2. Add UI component in `components/quiz/`
3. Update `QuizPlay.js` to render new type
4. Update backend grading logic
5. Test thoroughly

#### 2. New Chat Feature
1. Add endpoint in backend
2. Update `lib/api.ts` with new function
3. Modify `app/tutor/page.js`
4. Add UI components if needed
5. Test streaming behavior

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API URL |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key (backend) |
| `OPENAI_MODEL` | No | `gpt-4-1106-preview` | GPT model to use |
| `DATABASE_URL` | No | `sqlite:///./netsec.db` | Database connection |
| `CHROMA_PERSIST_DIRECTORY` | No | `./chroma_data` | ChromaDB storage path |
| `DUMPCAP_PATH` | No | Auto-detected | Path to dumpcap binary |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Backend not starting
```bash
# Check Python version
python --version  # Should be >= 3.9

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check if port 8000 is in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows
```

#### 3. OpenAI API errors
- Verify API key is correct in `.env`
- Check API key has GPT-4 access
- Verify billing is active
- Check rate limits

#### 4. Wireshark capture fails
```bash
# Verify dumpcap is installed
which dumpcap  # macOS/Linux
where dumpcap  # Windows

# Check permissions (macOS/Linux)
ls -la /dev/bpf*
groups | grep access_bpf

# Re-add to group if needed
sudo dseditgroup -o edit -a $USER -t user access_bpf

# Test capture
dumpcap -D  # List interfaces
dumpcap -i lo0 -a duration:5 -w test.pcapng  # Test capture
```

#### 5. ChromaDB errors
```bash
# Clear ChromaDB data
rm -rf chroma_data/
# Restart backend (will recreate database)
```

#### 6. Quiz generation fails
- Ensure documents are uploaded first
- Check at least 3 documents are processed
- Verify topic is Network Security related
- Check backend logs for specific errors

### Debug Mode

#### Frontend
```bash
# Enable verbose logging
NEXT_PUBLIC_DEBUG=true npm run dev
```

#### Backend
```bash
# Enable debug logging
LOG_LEVEL=DEBUG uvicorn main:app --reload
```

### Performance Optimization

#### Slow Quiz Generation
- Use smaller documents (< 10MB each)
- Reduce number of questions
- Check OpenAI API response time
- Consider caching common queries

#### Slow Chat Responses
- Verify ChromaDB index is healthy
- Reduce `top_k` parameter
- Optimize chunk size
- Check network latency

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/next-app.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

### Coding Standards

- Use ESLint for JavaScript
- Use Black for Python
- Write clear commit messages
- Add comments for complex logic
- Update README if needed

### Reporting Bugs

Create an issue with:
- **Title**: Clear, concise description
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: OS, browser, versions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 NetSec Arcade Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Wireshark** team for network analysis tools
- **ChromaDB** for vector database
- **Next.js** team for the amazing framework
- **FastAPI** for the backend framework
- **sentence-transformers** for embedding models

---

## 📞 Support

For questions and support:

- **GitHub Issues**: [Report a bug](https://github.com/Quiz-Rag/next-app/issues)
- **Documentation**: [Full Docs](https://github.com/Quiz-Rag/next-app/wiki)
- **Email**: support@netsec-arcade.com

---

<div align="center">

**Made with ❤️ by the NetSec Arcade Team**

[⬆ Back to Top](#-netsec-arcade---interactive-network-security-learning-platform)

</div>
