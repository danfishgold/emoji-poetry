import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jestSetup.ts'],
  transform: {
    '.*\\.[jt]sx?': 'ts-jest',
    '.*\\.json': 'ts-jest',
  },
}
export default config
