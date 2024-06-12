import type { JestConfigWithTsJest } from 'ts-jest'

// const { pathsToModuleNameMapper } = require('ts-jest')
// const { compilerOptions } = require('../tsconfig.base.json')

const jestConfig: JestConfigWithTsJest = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  // modulePaths: [compilerOptions.baseUrl],
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testRegex: '(/tests/.*)\\.(test|spec)\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        astTransformers: {
          before: [
            {
              path: 'ts-jest-mock-import-meta',
            },
          ],
        },
        diagnostics: {
          ignoreCodes: [1343],
        },
      },
    ],
  },
}

export default jestConfig
