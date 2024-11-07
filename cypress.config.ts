import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            const myEnv = dotenv.config()
            dotenvExpand.expand(myEnv)

            require('cypress-terminal-report/src/installLogsPrinter')(on)

            config.env = {
                ...config.env,
                ...process.env,
            }

            return config
        },
    },
})
