import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pos.system",
  appName: "POS System",
  webDir: "out",
  server: {
    // Point to hosted web app; start at /login
    url: "https://www.sevenspace.social",
    appStartPath: "/login",
    cleartext: false,
    allowNavigation: ["*.sevenspace.social"],
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
