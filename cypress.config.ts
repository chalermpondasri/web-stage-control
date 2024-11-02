import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // Load .env file
            const myEnv = dotenv.config()
            dotenvExpand.expand(myEnv)

            // Assign environment variables to Cypress config
            config.env = {
                ...config.env,
                ...process.env,
            }

            return config
        },
    },
})
