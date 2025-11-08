# 🎮 LaughLockdown

**Try Not to Laugh — Survive the Meme Apocalypse!**

A humorous survival game where you must keep a straight face while watching hilarious memes. The AI watches you through your webcam, and if you smile... you're OUT! 💀

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Webcam access

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

## 📂 Project Structure

```
LaughLockdown/
├── app/
│   ├── game/          # Main game page
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home/landing page
│   └── globals.css    # Global styles
├── components/
│   ├── MemeDisplay.tsx    # Meme display component
│   ├── WebcamView.tsx     # Webcam & smile detection
│   ├── GameHUD.tsx        # Timer and controls
│   └── ResultModal.tsx    # Game over screen
├── hooks/
│   ├── useMemeLoader.ts       # Meme rotation logic
│   ├── useSmileDetection.ts   # AI smile detection
│   └── useGameTimer.ts        # Survival timer
├── lib/
│   ├── constants.ts    # Game constants
│   ├── utils.ts        # Utility functions
│   └── leaderboard.ts  # Score tracking
└── public/
    └── memes/          # Place your meme images/videos here
```

## 🎯 Features

### Phase 1: Base Game ✅
- ✅ Meme display with automatic rotation (every 5 seconds)
- ✅ Webcam integration
- ✅ Game timer and controls
- ✅ Start/Pause/Resume functionality

### Phase 2: Smile Detection 🚧 (In Progress)
- ⚠️ Basic smile detection framework (currently simulated)
- 🔜 MediaPipe FaceMesh integration
- 🔜 TensorFlow.js model training
- ✅ Real-time status display

### Phase 3: Survival Mode ✅
- ✅ Survival time tracking
- ✅ Personal best records (localStorage)
- ✅ Game over screen with stats
- ✅ Retry functionality

### Phase 4: Multiplayer 🔜
- 🔜 WebRTC implementation
- 🔜 Multi-player lobbies
- 🔜 Spectator mode

### Phase 5: Polish 🔜
- 🔜 Public leaderboard
- 🔜 Sound effects
- 🔜 Advanced animations
- 🔜 Achievements system

## 🎨 Adding Memes

1. Add your meme images (`.jpg`, `.png`, `.gif`) or videos (`.mp4`, `.webm`) to the `public/memes/` folder
2. Update the `MEME_FILES` array in `lib/constants.ts`:

```typescript
export const MEME_FILES = [
  '/memes/meme1.jpg',
  '/memes/meme2.jpg',
  '/memes/funny-cat.gif',
  '/memes/epic-fail.mp4',
  // Add more memes here
];
```

## 🤖 Implementing Real Smile Detection

The current implementation uses simulated detection. To add real AI-powered smile detection:

### Option 1: MediaPipe FaceMesh
```bash
npm install @mediapipe/face_mesh @mediapipe/camera_utils
```

### Option 2: TensorFlow.js Face Landmarks
```bash
npm install @tensorflow-models/face-landmarks-detection
```

Update `hooks/useSmileDetection.ts` with your chosen implementation.

## 🎮 Game Controls

- **Start Game**: Begin the meme challenge
- **Pause**: Pause the game (timer stops)
- **Resume**: Continue playing
- **Quit**: Return to home screen
- **Try Again**: Restart after game over

## 🏆 Scoring System

- Timer starts when game begins
- Each meme shows for 5 seconds
- If you smile, the game ends immediately
- Your survival time is your score
- Personal best is saved locally

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI/ML**: TensorFlow.js, MediaPipe
- **Webcam**: react-webcam
- **Storage**: localStorage

## 📝 Development Notes

### Current Limitations
- Smile detection is currently simulated (5% random chance)
- Needs actual MediaPipe/TensorFlow integration
- Multiplayer not yet implemented
- No backend database (localStorage only)

### Next Steps
1. Integrate real smile detection model
2. Add more memes to the collection
3. Implement sound effects
4. Create leaderboard backend
5. Add multiplayer functionality

## 🐛 Known Issues

- Smile detection needs real ML model
- Webcam permission must be granted manually
- No mobile optimization yet
- Large meme files may cause loading delays

## 🤝 Contributing

Want to add features? Here's how:

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and entertainment purposes.

## 🎉 Have Fun!

Try not to laugh... if you can! 😂

---

**Built with ❤️ and lots of laughter**
