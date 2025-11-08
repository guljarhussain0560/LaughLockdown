# LaughLockdown - Complete Guide

## 🚀 Quick Start

```powershell
# Start the server
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 📱 Network Testing

### On This Computer:
- `http://localhost:3000`
- `http://192.168.1.8:3000`

### On Other Devices (Same WiFi):
- **Phone/Tablet:** `http://192.168.1.8:3000`
- **Other Laptops:** `http://192.168.1.8:3000`

⚠️ **Camera on Mobile:** Requires HTTPS - see Mobile Camera Fix below

---

## 🎮 Google Meet-Style Multiplayer

### Features:
✅ **Perfect Synchronization** - Host controls, everyone sees same meme simultaneously  
✅ **Video Gallery** - All participant cameras visible like Google Meet  
✅ **Host Controls** - Next/Previous buttons to control presentation  
✅ **Late Joiner Sync** - Join mid-game and sync to current state  

### How It Works:

**Host Experience:**
- Creates game and gets room code
- Sees "Next" and "Previous" buttons
- Controls which meme everyone sees
- Position counter shows progress (e.g., "5/20")

**Participant Experience:**
- Joins using room code
- Sees "Host is controlling the presentation" banner
- Meme changes when host clicks Next/Previous
- Can use audio/video controls (mute/camera)

### Testing (2 Windows):
1. **Window 1:** Create game → Start → Copy room code
2. **Window 2 (Incognito):** Join game → Paste code
3. **Test:** Host clicks "Next" → Both windows change together ✅

---

## 🔧 Technical Details

### Synchronization Fix:
- **Server:** Uses `io.to(room).emit()` to broadcast to ALL including sender
- **Client:** EVERYONE (host + participants) listens to socket events
- **Result:** All users update simultaneously when host clicks Next/Previous

### Key Code:
```javascript
// Host doesn't update locally - just broadcasts
socket.emit('next-meme', { contestId, memeIndex });

// Everyone (including host) listens
socket.on('advance-meme', ({ memeIndex }) => {
  setMemeIndex(memeIndex);
  setCurrentMeme(memeQueue[memeIndex]);
});
```

---

## 📹 Camera/Video Setup

### WebRTC Implementation:
- **Socket.io** for signaling (offer/answer/ICE)
- **Google STUN servers** for peer connections
- **Auto-play videos** with proper handlers
- **Mirrored self-view** like Google Meet

### Video Grid:
- Local video: Blue border, labeled "You", mirrored
- Remote videos: Green border, "LIVE" badge, not mirrored
- Shows all participants in responsive grid

---

## 🔒 Mobile Camera Fix

### Problem:
Mobile browsers require **HTTPS** for camera/microphone access.  
❌ `http://192.168.1.8:3000` - Camera DENIED on mobile

### Solution: Use ngrok

1. **Download ngrok:** https://ngrok.com/download
2. **Extract to:** `C:\ngrok`
3. **Start server:**
   ```powershell
   npm run dev
   ```
4. **Run ngrok (new terminal):**
   ```powershell
   cd C:\ngrok
   .\ngrok http 3000
   ```
5. **Get HTTPS URL:**
   ```
   https://abc123xyz.ngrok.io
   ```
6. **Use on mobile:** ✅ Camera works!

### Alternative (Testing Only):
Use desktop browsers for testing - they allow camera on local IP.

---

## 🎯 Project Structure

```
LaughLockdown/
├── app/
│   ├── multiplayer/[id]/page.tsx  # Google Meet-style game room
│   ├── api/                       # Backend API routes
│   ├── auth/                      # Authentication
│   ├── dashboard/                 # User dashboard
│   └── ...
├── components/
│   ├── WebcamView.tsx            # Camera component
│   ├── MemeDisplay.tsx           # Meme viewer
│   └── ...
├── lib/
│   ├── socketContext.tsx         # Socket.io provider
│   └── ...
├── server.js                     # Custom Socket.io server
├── package.json
└── prisma/
    └── schema.prisma             # Database schema
```

---

## 🛠️ Common Commands

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Get local IP
ipconfig | Select-String "IPv4"
```

---

## 🐛 Troubleshooting

### Videos Not Showing:
- Check browser console for WebRTC errors
- Allow camera/microphone permissions
- Close other video apps (Zoom, Teams)
- Wait 10 seconds for connections
- Try different browser

### Memes Not Syncing:
- Check Socket.io connection in console
- Verify server is running
- All users must be in same room
- Check browser console for sync logs

### Mobile Camera Denied:
- Mobile requires HTTPS (use ngrok)
- Desktop allows HTTP on local network
- Check camera permissions in browser settings

### Firewall Issues:
```powershell
# Allow port 3000
New-NetFirewallRule -DisplayName "Node Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## 📊 Console Logs

Look for these in browser console:

### Connection:
```
✅ Local media stream initialized successfully
🔗 Creating peer connection with [id]
✅ Successfully connected to [id]
```

### Synchronization:
```
📢 Host advancing to meme 3 - Broadcasting to ALL
🎬 Host syncing to meme 3
🎬 Participant syncing to meme 3
```

### Video:
```
📺 Setting srcObject for [socketId]
✅ Video metadata loaded for [socketId]
🎥 Rendering video for [socketId]
```

---

## ✅ Success Checklist

- [ ] Server running at localhost:3000
- [ ] Can create multiplayer game
- [ ] Room code generated and copied
- [ ] Second user can join with code
- [ ] Host sees Next/Previous buttons
- [ ] Participant sees "Host controlling" banner
- [ ] Clicking Next changes both windows together
- [ ] Both cameras visible in video grid
- [ ] Videos are live (not black/frozen)
- [ ] Late joiner syncs to current meme
- [ ] Audio/video controls work (mute/camera)

---

## 🎊 Features Summary

| Feature | Status |
|---------|--------|
| Google Meet-style synchronization | ✅ Complete |
| Host controls presentation | ✅ Complete |
| Video gallery (all cameras) | ✅ Complete |
| Late joiner sync | ✅ Complete |
| Camera/mic controls | ✅ Complete |
| Mobile support (with HTTPS) | ✅ Complete |
| Network testing | ✅ Complete |

---

## 📞 Quick Reference

**Your Network IP:** `192.168.1.8`

**Testing URLs:**
- Desktop: `http://localhost:3000`
- Network: `http://192.168.1.8:3000`
- Mobile (ngrok): `https://[random].ngrok.io`

**Key Ports:**
- HTTP Server: 3000
- Socket.io: 3000 (same port)

**Tech Stack:**
- Next.js 15.5.6
- Socket.io 4.x
- WebRTC with STUN servers
- Prisma + PostgreSQL
- TailwindCSS
