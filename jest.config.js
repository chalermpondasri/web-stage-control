/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@libs(.*)$': '<rootDir>/libs$1',
        '^@main(.*)$': '<rootDir>/apps/main$',
        '^@pubsub(.*)$': '<rootDir>/apps/pubsub',
    },
}
