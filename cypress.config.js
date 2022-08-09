const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    video: false,
    setupNodeEvents(on, config) {
        on('before:browser:launch', (browser = {}, launchOptions) => {
          // `args` is an array of all the arguments that will
          // be passed to browsers when it launches
          console.log(launchOptions.args) // print all current args
          if (browser.family === 'chromium' && browser.name !== 'electron') {
            // auto open devtools
            launchOptions.args.push('--auto-open-devtools-for-tabs')
            launchOptions.args.push('--disable-dev-shm-usage')
          }
          if (browser.family === 'firefox') {
            // auto open devtools
            launchOptions.args.push('-devtools')
          }
          if (browser.name === 'electron') {
            // auto open devtools
            launchOptions.preferences.devTools = true
          }
          // whatever you return here becomes the launchOptions
          return launchOptions
        })
    },
  },
});
