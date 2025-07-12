import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.598a3475991a41ce9a3fae2155f7a400',
  appName: 'Budding Geniuses Quiz Controller',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://598a3475-991a-41ce-9a3f-ae2155f7a400.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#00ff88'
    }
  }
};

export default config;