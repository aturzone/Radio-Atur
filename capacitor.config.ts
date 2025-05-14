
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a83e8bde699e4dd5b301cc0b6ebcc926',
  appName: 'cozy-audio-cafe',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://a83e8bde-699e-4dd5-b301-cc0b6ebcc926.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Add necessary plugin configurations here
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6c4a4a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
