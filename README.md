
# Cozy Audio Café

A calm, relaxing music player web app inspired by the ambiance of cozy bookshops. Perfect for creating a pleasant atmosphere while reading, working, or relaxing.

![Cozy Audio Café Screenshot](RADIO-ATUR.png)

## Features

- 🎵 Clean, minimalist music player interface
- 📁 Folder-based playlist organization
- 🌓 Dark/Light mode toggle
- 📱 Fully responsive design
- ☕ "Buy Me a Coffee" support link
- 🎨 Soothing coffee-inspired color scheme

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cozy-audio-cafe.git
cd cozy-audio-cafe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:5173/

## Adding Your Own Music

To add your own music to the player:

1. Place your audio files in the `public/music` directory
2. Update the track information in `src/data/sampleTracks.ts`

Example track format:
```typescript
{
  id: "unique-id",
  title: "Track Title",
  artist: "Artist Name",
  album: "Album Name",
  cover: "/path/to/cover-image.jpg",
  url: "/music/your-audio-file.mp3"
}
```

## Deployment

Build the application for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready to be deployed to any static web hosting service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you enjoy using Cozy Audio Café, consider supporting the project by clicking the "Buy Me a Coffee" button in the app.

## Acknowledgments

- Background music samples by [Sample Provider]
- UI components powered by Shadcn UI
- Icons by Lucide React
