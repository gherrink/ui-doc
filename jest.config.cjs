// const { pathsToModuleNameMapper } = require('ts-jest')
// const { compilerOptions } = require('../tsconfig.base.json')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  // modulePaths: [compilerOptions.baseUrl],
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testRegex: '(/tests/.*)\\.(test|spec)\\.(jsx?|tsx?)$',
}
