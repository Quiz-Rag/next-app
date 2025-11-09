# NetSec Arcade

An interactive network security learning platform built with Next.js, featuring a game-style quiz system and educational modules.

## Features

- **Quiz Module** - Interactive quiz system with:
  - Chat-style setup interface
  - Multiple topics (Network Fundamentals, Cryptography, Web Security)
  - Three difficulty levels (Easy, Medium, Hard)
  - Animated loading and grading screens
  - Detailed results with explanations
  - Local leaderboard tracking

- **Coming Soon:**
  - Train Database
  - Wireshark Analysis
  - AI Tutor

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **CSS Modules** - Styling
- **Local JSON** - Mock data storage

## Getting Started

1. Install dependencies:
```bash
npm install

# Install dependencies for running wireshark
# Mac users
brew install wireshark
# allow non-root users capture:
sudo dsesitgroup -o edit -a"$USER" -t user access_bpf
# close and reopen shell, then verify with:
dumpcap -D
# Where to save captures
mkdir -p "$PWD/captures"
export CAP_DIR="$PWD/captures"

# Ubuntu Users
sudo apt update
sudo apt install -y wireshark tshark
sudo dpkg-reconfigure wireshark-common #choose yes
sudo usermod -aG wireshark $USER
# close and reopen shell, then verify with:
dumpcap -D
mkdir -p "$PWD/captures"
export CAP_DIR="$PWD/captures"

# Windows Users
# Install native wireshark, during install 
# "Install Npcap"
# "Support loopback traffic" (if offered)
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
next-app/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout with navigation
│   ├── page.js            # Home (redirects to quiz)
│   ├── quiz/              # Quiz module
│   ├── train-db/          # Train DB (under development)
│   ├── wireshark/         # Wireshark (under development)
│   └── tutor/             # Tutor (under development)
├── components/            # Reusable components
│   ├── Navigation.js      # Top navigation bar
│   ├── UnderDevelopment.js
│   └── quiz/              # Quiz-specific components
│       ├── QuizSetup.js
│       ├── QuizLoading.js
│       ├── QuizPlay.js
│       ├── QuizGrading.js
│       └── QuizResults.js
├── data/                  # Mock JSON data
│   ├── quiz-questions.json
│   └── quiz-topics.json
└── lib/                   # Utility functions
    └── quizData.js        # Quiz data management
```

## Quiz Module Usage

1. Navigate to the Quiz page
2. Select a topic from the chat interface
3. Choose your difficulty level
4. Select the number of questions
5. Answer the questions
6. View your results and detailed feedback

Quiz results are stored in browser localStorage and displayed on the leaderboard.

## Development

This project uses:
- **Pure JavaScript** (no TypeScript)
- **CSS Modules** for component styling
- **No Tailwind** - custom CSS with design tokens
- **Local JSON files** for data (ready for future FastAPI integration)

## Future Enhancements

- FastAPI backend integration
- Train Database module
- Wireshark packet analysis tool
- AI-powered tutor chatbot
- User authentication
- Progress tracking
- Certificate generation

## License

MIT
