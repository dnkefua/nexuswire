import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ndnanalytics.nexuswire',
  appName: 'NexusWire',
  webDir: 'public',
  server: {
    url: 'https://nexuswire--nexuswire-app.europe-west4.hosted.app',
    cleartext: false
  }
};

export default config;
