# Live Health Scanner

A Next.js 14 PWA application that uses your device camera to scan food products and provides instant health analysis using OpenAI's Vision API. The app works as a Progressive Web App (PWA) and can be installed on mobile devices.

## Features

- 📱 **Camera Integration**: Uses device rear camera for live food scanning
- 🤖 **AI Analysis**: Powered by OpenAI Vision API (GPT-4o-mini by default)
- 📊 **Health Scoring**: 1-10 health score with detailed pros and cons
- 🔊 **Text-to-Speech**: Automatic voice announcements of health scores
- 📱 **PWA Ready**: Install on mobile devices, works offline-first
- 🔒 **Secure**: Server-side proxy protects API keys
- ⚡ **Real-time**: Analyzes frames every 2.5 seconds during live scanning

## Quick Start

### Prerequisites

- Node.js 18+ or pnpm
- OpenAI API key with Vision API access

### Installation

1. **Clone and install dependencies:**
```bash
cd /Users/alico/CascadeProjects/live-health-scanner
npm install
# or
pnpm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

3. **Run development server:**
```bash
npm run dev
# or
pnpm dev
```

4. **Open in browser:**
Navigate to `http://localhost:3000`

## Development

### Project Structure

```
/
├── app/
│   ├── layout.tsx          # App layout with PWA meta tags
│   ├── page.tsx            # Main camera + UI page
│   └── api/
│       └── analyze/route.ts # Edge API route for OpenAI proxy
├── components/
│   ├── StatusPill.tsx      # Status indicator component
│   ├── Gauge.tsx           # Circular health score gauge
│   ├── ProsConsCard.tsx    # Pros/cons display cards
│   └── Controls.tsx        # Settings and scan controls
├── lib/
│   ├── parseJson.ts        # JSON parsing utilities
│   ├── speech.ts           # Text-to-speech helpers
│   └── camera.ts           # Camera capture utilities
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   ├── icon-192.png       # PWA icons
│   └── icon-512.png
└── styles/
    └── globals.css         # Global styles with Tailwind
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key with Vision access | Yes |

### API Endpoints

- `POST /api/analyze` - Analyzes food images via OpenAI Vision API
  - Body: `{ dataUrl: string, model?: string }`
  - Returns: `{ score: number, pros: string[], cons: string[] }`

## Deployment (Vercel)

### One-Click Deploy

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - Click "Deploy"

3. **Configure Domain (Optional):**
   - Add custom domain in Vercel dashboard
   - Ensure HTTPS is enabled for camera access

### Manual Deploy

```bash
npm run build
npm start
```

## Mobile Usage Notes

### iOS Safari
- Requires user interaction to start camera
- Uses `playsInline` and `muted` attributes
- Add to Home Screen for full PWA experience

### Android Chrome
- Camera permissions handled automatically
- Install prompt appears after engagement
- Works in standalone mode when installed

### PWA Installation
1. Open the app in mobile browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Add to Home Screen"
4. App will work like a native app

## Technical Details

### Rate Limiting
- Simple in-memory rate limiting: 1 request per 2 seconds per IP
- Edge runtime compatible (no persistent storage)

### Image Processing
- Captures frames at 720p max resolution
- JPEG compression at 0.8 quality
- Automatic scaling for bandwidth optimization

### Privacy & Security
- No data logging or persistent storage
- API key never exposed to client
- `Cache-Control: no-store` on all API responses

### Browser Compatibility
- Modern browsers with `getUserMedia` support
- WebRTC camera access required
- Speech Synthesis API for voice features

## Troubleshooting

### Camera Issues
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try refreshing the page
- On iOS: tap "Start Scanning" button

### API Issues
- Verify OpenAI API key is valid
- Check API key has Vision API access
- Monitor rate limits in browser console

### PWA Issues
- Ensure manifest.json is accessible
- Check service worker registration
- Verify HTTPS for installation prompts

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

---

**Ready to scan!** Point your camera at packaged food products and get instant health insights powered by AI.
