import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fi.converto.app',
  appName: 'Converto',
  webDir: 'dist',
  server: {
    // Production URL - your Next.js app
    url: 'https://app.converto.fi',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      spinnerColor: "#6366f1"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
