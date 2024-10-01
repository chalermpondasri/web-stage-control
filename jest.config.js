/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@libs(.*)$': '<rootDir>/libs$1',
        '^@auth(.*)$': '<rootDir>/apps/auth$1',
        '^@pubsub(.*)$': '<rootDir>/apps/pubsub$1',
    },
}
