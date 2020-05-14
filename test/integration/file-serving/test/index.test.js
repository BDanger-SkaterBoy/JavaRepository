/* eslint-env jest */
/* global jasmine */
import fs from 'fs-extra'
import { join } from 'path'
import {
  killApp,
  findPort,
  nextBuild,
  nextStart,
  fetchViaHTTP,
  launchApp,
} from 'next-test-utils'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 2

const appDir = join(__dirname, '../')
let appPort
let app

const expectStatus = async path => {
  const containRegex = /(This page could not be found|Bad Request)/
  // test base mount point `public/`
  const res = await fetchViaHTTP(appPort, path)
  expect(res.status === 400 || res.status === 404).toBe(true)
  expect(await res.text()).toMatch(containRegex)

  // test `/_next` mount point
  const res2 = await fetchViaHTTP(appPort, `/_next/${path}`)
  expect(res2.status === 400 || res2.status === 404).toBe(true)
  expect(await res2.text()).toMatch(containRegex)

  // test `/static` mount point
  const res3 = await fetchViaHTTP(appPort, `/static/${path}`)
  expect(res3.status === 400 || res3.status === 404).toBe(true)
  expect(await res3.text()).toMatch(containRegex)
}

const runTests = () => {
  it('should serve file with space correctly from public/', async () => {
    const res = await fetchViaHTTP(appPort, '/hello world.txt')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('hi')
  })

  it('should serve file with space correctly static/', async () => {
    const res = await fetchViaHTTP(appPort, '/static/hello world.txt')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('hi')
  })

  // checks against traversal requests from
  // https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Directory%20Traversal/Intruder/traversals-8-deep-exotic-encoding.txt

  it('should prevent treversing with /../test-file.txt', async () => {
    await expectStatus('/../test-file.txt')
  })

  it('should prevent treversing with /../../test-file.txt', async () => {
    await expectStatus('/../../test-file.txt')
  })

  it('should prevent treversing with /../../../test-file.txt', async () => {
    await expectStatus('/../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../test-file.txt', async () => {
    await expectStatus('/../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /..%2ftest-file.txt', async () => {
    await expectStatus('/..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252ftest-file.txt', async () => {
    await expectStatus('/..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252f%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..\\test-file.txt', async () => {
    await expectStatus('/..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..%255ctest-file.txt', async () => {
    await expectStatus('/..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255c%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%aftest-file.txt', async () => {
    await expectStatus('/..%c0%aftest-file.txt')
  })

  it('should prevent treversing with /..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus('/..%c0%af..%c0%aftest-file.txt')
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus('/..%c0%af..%c0%af..%c0%aftest-file.txt')
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus('/..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt')
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus('/..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt')
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%af..%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae/test-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae%c0%aftest-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%af%c0%ae%c0%ae%c0%aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c0%25aftest-file.txt', async () => {
    await expectStatus('/..%25c0%25aftest-file.txt')
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus('/..%25c0%25af..%25c0%25aftest-file.txt')
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus('/..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt')
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25af..%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus('/%25c0%25ae%25c0%25ae/test-file.txt')
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/%25c0%25ae%25c0%25ae/test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus('/%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt')
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25af%25c0%25ae%25c0%25ae%25c0%25aftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c1%9ctest-file.txt', async () => {
    await expectStatus('/..%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus('/..%c1%9c..%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus('/..%c1%9c..%c1%9c..%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus('/..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus('/..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae\\test-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\%c0%ae%c0%ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus('/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt')
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9c%c0%ae%c0%ae%c1%9ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c1%259ctest-file.txt', async () => {
    await expectStatus('/..%25c1%259ctest-file.txt')
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus('/..%25c1%259c..%25c1%259ctest-file.txt')
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus('/..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt')
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259c..%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus('/%25c0%25ae%25c0%25ae\\test-file.txt')
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\%25c0%25ae%25c0%25ae\\test-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus('/%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt')
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt', async () => {
    await expectStatus(
      '/%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259c%25c0%25ae%25c0%25ae%25c1%259ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%%32%66test-file.txt', async () => {
    await expectStatus('/..%%32%66test-file.txt')
  })

  it('should prevent treversing with /..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus('/..%%32%66..%%32%66test-file.txt')
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus('/..%%32%66..%%32%66..%%32%66test-file.txt')
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus('/..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt')
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus(
      '/..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus(
      '/..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus(
      '/..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt', async () => {
    await expectStatus(
      '/..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66..%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65/test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65/%%32%65%%32%65/test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65%%32%66test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66%%32%65%%32%65%%32%66test-file.txt'
    )
  })

  it('should prevent treversing with /..%%35%63test-file.txt', async () => {
    await expectStatus('/..%%35%63test-file.txt')
  })

  it('should prevent treversing with /..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus('/..%%35%63..%%35%63test-file.txt')
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus('/..%%35%63..%%35%63..%%35%63test-file.txt')
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus('/..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt')
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus(
      '/..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus(
      '/..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus(
      '/..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt', async () => {
    await expectStatus(
      '/..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63..%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65/test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65/%%32%65%%32%65/test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/%%32%65%%32%65/test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus('/%%32%65%%32%65%%35%63test-file.txt')
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt', async () => {
    await expectStatus(
      '/%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63%%32%65%%32%65%%35%63test-file.txt'
    )
  })

  it('should prevent treversing with /../test-file.txt', async () => {
    await expectStatus('/../test-file.txt')
  })

  it('should prevent treversing with /../../test-file.txt', async () => {
    await expectStatus('/../../test-file.txt')
  })

  it('should prevent treversing with /../../../test-file.txt', async () => {
    await expectStatus('/../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../test-file.txt', async () => {
    await expectStatus('/../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /..%2ftest-file.txt', async () => {
    await expectStatus('/..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252ftest-file.txt', async () => {
    await expectStatus('/..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252f%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..\\test-file.txt', async () => {
    await expectStatus('/..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..%5ctest-file.txt', async () => {
    await expectStatus('/..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255ctest-file.txt', async () => {
    await expectStatus('/..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255c%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /../test-file.txt', async () => {
    await expectStatus('/../test-file.txt')
  })

  it('should prevent treversing with /../../test-file.txt', async () => {
    await expectStatus('/../../test-file.txt')
  })

  it('should prevent treversing with /../../../test-file.txt', async () => {
    await expectStatus('/../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../test-file.txt', async () => {
    await expectStatus('/../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /../../../../../../../../test-file.txt', async () => {
    await expectStatus('/../../../../../../../../test-file.txt')
  })

  it('should prevent treversing with /..%2ftest-file.txt', async () => {
    await expectStatus('/..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt', async () => {
    await expectStatus('/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus('/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt')
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252ftest-file.txt', async () => {
    await expectStatus('/..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus('/..%252f..%252f..%252f..%252f..%252ftest-file.txt')
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt', async () => {
    await expectStatus(
      '/..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus('/%252e%252e/%252e%252e/%252e%252e/test-file.txt')
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/%252e%252e/test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus('/%252e%252e%252f%252e%252e%252ftest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252ftest-file.txt'
    )
  })

  it('should prevent treversing with /..\\test-file.txt', async () => {
    await expectStatus('/..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt')
  })

  it('should prevent treversing with /..%5ctest-file.txt', async () => {
    await expectStatus('/..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt', async () => {
    await expectStatus('/..%5c..%5c..%5c..%5c..%5c..%5c..%5c..%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus('/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt')
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\%2e%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255ctest-file.txt', async () => {
    await expectStatus('/..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus('/..%255c..%255c..%255c..%255c..%255ctest-file.txt')
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt', async () => {
    await expectStatus(
      '/..%255c..%255c..%255c..%255c..%255c..%255c..%255c..%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus('/%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt')
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt', async () => {
    await expectStatus(
      '/%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\%252e%252e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus('/%252e%252e%255c%252e%252e%255ctest-file.txt')
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt', async () => {
    await expectStatus(
      '/%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255c%252e%252e%255ctest-file.txt'
    )
  })

  it('should prevent treversing with /\\../test-file.txt', async () => {
    await expectStatus('/\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../\\../\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../\\../\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with /\\../\\../\\../\\../\\../\\../\\../\\../test-file.txt', async () => {
    await expectStatus('/\\../\\../\\../\\../\\../\\../\\../\\../test-file.txt')
  })

  it('should prevent treversing with //..\\test-file.txt', async () => {
    await expectStatus('//..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\/..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\/..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\/..\\/..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\/..\\/..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with //..\\/..\\/..\\/..\\/..\\/..\\/..\\/..\\test-file.txt', async () => {
    await expectStatus('//..\\/..\\/..\\/..\\/..\\/..\\/..\\/..\\test-file.txt')
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/../../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.../test-file.txt', async () => {
    await expectStatus('/.../test-file.txt')
  })

  it('should prevent treversing with /.../.../test-file.txt', async () => {
    await expectStatus('/.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../.../.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../.../.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../.../.../.../.../test-file.txt')
  })

  it('should prevent treversing with /.../.../.../.../.../.../.../.../test-file.txt', async () => {
    await expectStatus('/.../.../.../.../.../.../.../.../test-file.txt')
  })

  it('should prevent treversing with /...\\test-file.txt', async () => {
    await expectStatus('/...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\...\\...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\...\\...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /...\\...\\...\\...\\...\\...\\...\\...\\test-file.txt', async () => {
    await expectStatus('/...\\...\\...\\...\\...\\...\\...\\...\\test-file.txt')
  })

  it('should prevent treversing with /..../test-file.txt', async () => {
    await expectStatus('/..../test-file.txt')
  })

  it('should prevent treversing with /..../..../test-file.txt', async () => {
    await expectStatus('/..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../..../..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../..../..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../..../..../..../..../test-file.txt')
  })

  it('should prevent treversing with /..../..../..../..../..../..../..../..../test-file.txt', async () => {
    await expectStatus('/..../..../..../..../..../..../..../..../test-file.txt')
  })

  it('should prevent treversing with /....\\test-file.txt', async () => {
    await expectStatus('/....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\test-file.txt', async () => {
    await expectStatus('/....\\....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\....\\test-file.txt', async () => {
    await expectStatus('/....\\....\\....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\....\\....\\test-file.txt', async () => {
    await expectStatus('/....\\....\\....\\....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\....\\....\\....\\test-file.txt', async () => {
    await expectStatus('/....\\....\\....\\....\\....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\....\\....\\....\\....\\test-file.txt', async () => {
    await expectStatus('/....\\....\\....\\....\\....\\....\\test-file.txt')
  })

  it('should prevent treversing with /....\\....\\....\\....\\....\\....\\....\\test-file.txt', async () => {
    await expectStatus(
      '/....\\....\\....\\....\\....\\....\\....\\test-file.txt'
    )
  })

  it('should prevent treversing with /....\\....\\....\\....\\....\\....\\....\\....\\test-file.txt', async () => {
    await expectStatus(
      '/....\\....\\....\\....\\....\\....\\....\\....\\test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /........................................................................../../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/........................................................................../../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..........................................................................\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/..........................................................................\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2215test-file.txt', async () => {
    await expectStatus('/..%u2215test-file.txt')
  })

  it('should prevent treversing with /..%u2215..%u2215test-file.txt', async () => {
    await expectStatus('/..%u2215..%u2215test-file.txt')
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus('/..%u2215..%u2215..%u2215test-file.txt')
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus('/..%u2215..%u2215..%u2215..%u2215test-file.txt')
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus('/..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt')
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus(
      '/..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus(
      '/..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt', async () => {
    await expectStatus(
      '/..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215..%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e/test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e/%uff0e%uff0e/test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/%uff0e%uff0e/test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e%u2215test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215%uff0e%uff0e%u2215test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2216test-file.txt', async () => {
    await expectStatus('/..%u2216test-file.txt')
  })

  it('should prevent treversing with /..%u2216..%u2216test-file.txt', async () => {
    await expectStatus('/..%u2216..%u2216test-file.txt')
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus('/..%u2216..%u2216..%u2216test-file.txt')
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus('/..%u2216..%u2216..%u2216..%u2216test-file.txt')
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus('/..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt')
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus(
      '/..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus(
      '/..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt', async () => {
    await expectStatus(
      '/..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216..%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /..%uEFC8test-file.txt', async () => {
    await expectStatus('/..%uEFC8test-file.txt')
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus('/..%uEFC8..%uEFC8test-file.txt')
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus('/..%uEFC8..%uEFC8..%uEFC8test-file.txt')
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus('/..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt')
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus('/..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt')
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus(
      '/..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt'
    )
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus(
      '/..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt'
    )
  })

  it('should prevent treversing with /..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt', async () => {
    await expectStatus(
      '/..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8..%uEFC8test-file.txt'
    )
  })

  it('should prevent treversing with /..%uF025test-file.txt', async () => {
    await expectStatus('/..%uF025test-file.txt')
  })

  it('should prevent treversing with /..%uF025..%uF025test-file.txt', async () => {
    await expectStatus('/..%uF025..%uF025test-file.txt')
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus('/..%uF025..%uF025..%uF025test-file.txt')
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus('/..%uF025..%uF025..%uF025..%uF025test-file.txt')
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus('/..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt')
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus(
      '/..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt'
    )
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus(
      '/..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt'
    )
  })

  it('should prevent treversing with /..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt', async () => {
    await expectStatus(
      '/..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025..%uF025test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e\\test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\%uff0e%uff0e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e%u2216test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus('/%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt')
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt', async () => {
    await expectStatus(
      '/%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216%uff0e%uff0e%u2216test-file.txt'
    )
  })

  it('should prevent treversing with /..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2f..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2f..0x2f..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2f..0x2f..0x2f..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus('/..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt')
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus(
      '/..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt', async () => {
    await expectStatus(
      '/..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2f..0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e/test-file.txt', async () => {
    await expectStatus('/0x2e0x2e/test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus('/0x2e0x2e/0x2e0x2e/test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus('/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus('/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/0x2e0x2e/test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x2ftest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2f0x2e0x2e0x2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5c..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5c..0x5c..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5c..0x5c..0x5c..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus('/..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt')
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus(
      '/..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt', async () => {
    await expectStatus(
      '/..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5c..0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e\\test-file.txt', async () => {
    await expectStatus('/0x2e0x2e\\test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus('/0x2e0x2e\\0x2e0x2e\\test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus('/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus('/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\0x2e0x2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x5ctest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus('/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt')
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt', async () => {
    await expectStatus(
      '/0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5c0x2e0x2e0x5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%2ftest-file.txt', async () => {
    await expectStatus('/..%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus('/..%c0%2f..%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus('/..%c0%2f..%c0%2f..%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus('/..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus('/..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2f..%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e/test-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/%c0%2e%c0%2e/test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2f%c0%2e%c0%2e%c0%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%5ctest-file.txt', async () => {
    await expectStatus('/..%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus('/..%c0%5c..%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus('/..%c0%5c..%c0%5c..%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus('/..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus('/..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5c..%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e\\test-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\%c0%2e%c0%2e\\test-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus('/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt')
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt', async () => {
    await expectStatus(
      '/%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5c%c0%2e%c0%2e%c0%5ctest-file.txt'
    )
  })

  it('should prevent treversing with ////%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('////%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('////%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('////%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus('////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt')
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with ////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt', async () => {
    await expectStatus(
      '////%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2ftest-file.txt'
    )
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/\\\\\\%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/\\\\\\%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus('/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt')
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt', async () => {
    await expectStatus(
      '/\\\\\\%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5c%2e%2e%5ctest-file.txt'
    )
  })

  it('should prevent treversing with /..//test-file.txt', async () => {
    await expectStatus('/..//test-file.txt')
  })

  it('should prevent treversing with /..//..//test-file.txt', async () => {
    await expectStatus('/..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//..//..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//..//..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..//..//..//..//..//..//..//..//test-file.txt', async () => {
    await expectStatus('/..//..//..//..//..//..//..//..//test-file.txt')
  })

  it('should prevent treversing with /..///test-file.txt', async () => {
    await expectStatus('/..///test-file.txt')
  })

  it('should prevent treversing with /..///..///test-file.txt', async () => {
    await expectStatus('/..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///..///..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///..///..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..///..///..///..///..///..///..///..///test-file.txt', async () => {
    await expectStatus('/..///..///..///..///..///..///..///..///test-file.txt')
  })

  it('should prevent treversing with /..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\..\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\..\\\\..\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\..\\\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\..\\\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /./\\/./test-file.txt', async () => {
    await expectStatus('/./\\/./test-file.txt')
  })

  it('should prevent treversing with /./\\/././\\/./test-file.txt', async () => {
    await expectStatus('/./\\/././\\/./test-file.txt')
  })

  it('should prevent treversing with /./\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus('/./\\/././\\/././\\/./test-file.txt')
  })

  it('should prevent treversing with /./\\/././\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus('/./\\/././\\/././\\/././\\/./test-file.txt')
  })

  it('should prevent treversing with /./\\/././\\/././\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus('/./\\/././\\/././\\/././\\/././\\/./test-file.txt')
  })

  it('should prevent treversing with /./\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus(
      '/./\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt'
    )
  })

  it('should prevent treversing with /./\\/././\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus(
      '/./\\/././\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt'
    )
  })

  it('should prevent treversing with /./\\/././\\/././\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt', async () => {
    await expectStatus(
      '/./\\/././\\/././\\/././\\/././\\/././\\/././\\/././\\/./test-file.txt'
    )
  })

  it('should prevent treversing with /.\\/\\.\\test-file.txt', async () => {
    await expectStatus('/.\\/\\.\\test-file.txt')
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus('/.\\/\\.\\.\\/\\.\\test-file.txt')
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus('/.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt')
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus('/.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt')
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus(
      '/.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus(
      '/.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus(
      '/.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt', async () => {
    await expectStatus(
      '/.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../../../test-file.txt', async () => {
    await expectStatus(
      '/././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././././../../../../../../../../test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\..\\..\\..\\..\\..\\..\\..\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /./../test-file.txt', async () => {
    await expectStatus('/./../test-file.txt')
  })

  it('should prevent treversing with /./.././../test-file.txt', async () => {
    await expectStatus('/./.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././.././.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././.././.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././.././.././.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././.././.././.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././.././.././.././.././../test-file.txt')
  })

  it('should prevent treversing with /./.././.././.././.././.././.././.././../test-file.txt', async () => {
    await expectStatus('/./.././.././.././.././.././.././.././../test-file.txt')
  })

  it('should prevent treversing with /.\\..\\test-file.txt', async () => {
    await expectStatus('/.\\..\\test-file.txt')
  })

  it('should prevent treversing with /.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus('/.\\..\\.\\..\\test-file.txt')
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus('/.\\..\\.\\..\\.\\..\\test-file.txt')
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus('/.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt')
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus('/.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt')
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt', async () => {
    await expectStatus(
      '/.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\.\\..\\test-file.txt'
    )
  })

  it('should prevent treversing with /.//..//test-file.txt', async () => {
    await expectStatus('/.//..//test-file.txt')
  })

  it('should prevent treversing with /.//..//.//..//test-file.txt', async () => {
    await expectStatus('/.//..//.//..//test-file.txt')
  })

  it('should prevent treversing with /.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus('/.//..//.//..//.//..//test-file.txt')
  })

  it('should prevent treversing with /.//..//.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus('/.//..//.//..//.//..//.//..//test-file.txt')
  })

  it('should prevent treversing with /.//..//.//..//.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus('/.//..//.//..//.//..//.//..//.//..//test-file.txt')
  })

  it('should prevent treversing with /.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus(
      '/.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt'
    )
  })

  it('should prevent treversing with /.//..//.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus(
      '/.//..//.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt'
    )
  })

  it('should prevent treversing with /.//..//.//..//.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt', async () => {
    await expectStatus(
      '/.//..//.//..//.//..//.//..//.//..//.//..//.//..//.//..//test-file.txt'
    )
  })

  it('should prevent treversing with /.\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/.\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/.\\\\..\\\\.\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus('/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt', async () => {
    await expectStatus(
      '/.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\.\\\\..\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /../test-file.txt', async () => {
    await expectStatus('/../test-file.txt')
  })

  it('should prevent treversing with /../..//test-file.txt', async () => {
    await expectStatus('/../..//test-file.txt')
  })

  it('should prevent treversing with /../..//../test-file.txt', async () => {
    await expectStatus('/../..//../test-file.txt')
  })

  it('should prevent treversing with /../..//../..//test-file.txt', async () => {
    await expectStatus('/../..//../..//test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../test-file.txt', async () => {
    await expectStatus('/../..//../..//../test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..//test-file.txt', async () => {
    await expectStatus('/../..//../..//../..//test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..//../test-file.txt', async () => {
    await expectStatus('/../..//../..//../..//../test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..//../..//test-file.txt', async () => {
    await expectStatus('/../..//../..//../..//../..//test-file.txt')
  })

  it('should prevent treversing with /..\\test-file.txt', async () => {
    await expectStatus('/..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\..\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\..\\\\..\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\..\\..\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\..\\\\..\\..\\\\test-file.txt')
  })

  it('should prevent treversing with /..///test-file.txt', async () => {
    await expectStatus('/..///test-file.txt')
  })

  it('should prevent treversing with /../..///test-file.txt', async () => {
    await expectStatus('/../..///test-file.txt')
  })

  it('should prevent treversing with /../..//..///test-file.txt', async () => {
    await expectStatus('/../..//..///test-file.txt')
  })

  it('should prevent treversing with /../..//../..///test-file.txt', async () => {
    await expectStatus('/../..//../..///test-file.txt')
  })

  it('should prevent treversing with /../..//../..//..///test-file.txt', async () => {
    await expectStatus('/../..//../..//..///test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..///test-file.txt', async () => {
    await expectStatus('/../..//../..//../..///test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..//..///test-file.txt', async () => {
    await expectStatus('/../..//../..//../..//..///test-file.txt')
  })

  it('should prevent treversing with /../..//../..//../..//../..///test-file.txt', async () => {
    await expectStatus('/../..//../..//../..//../..///test-file.txt')
  })

  it('should prevent treversing with /..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\..\\\\\\test-file.txt', async () => {
    await expectStatus('/..\\..\\\\..\\..\\\\..\\..\\\\..\\\\\\test-file.txt')
  })

  it('should prevent treversing with /..\\..\\\\..\\..\\\\..\\..\\\\..\\..\\\\\\test-file.txt', async () => {
    await expectStatus(
      '/..\\..\\\\..\\..\\\\..\\..\\\\..\\..\\\\\\test-file.txt'
    )
  })

  it('should prevent treversing with /\\..%2f', async () => {
    await expectStatus('/\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f', async () => {
    await expectStatus('/\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f')
  })

  it('should prevent treversing with /\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2ftest-file.txt', async () => {
    await expectStatus(
      '/\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2f\\..%2ftest-file.txt'
    )
  })
}

const copyTestFileToDist = () =>
  fs.copy(join(appDir, 'test-file.txt'), join(appDir, '.next', 'test-file.txt'))

describe('File Serving', () => {
  describe('dev mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        // don't log stdout and stderr as we're going to generate
        // a lot of output from resolve mismatches
        stdout: false,
        stderr: false,
      })
      await copyTestFileToDist()
    })
    afterAll(async () => {
      await killApp(app)
    })

    runTests(true)
  })

  describe('production mode', () => {
    beforeAll(async () => {
      const { code } = await nextBuild(appDir)

      if (code !== 0) {
        throw new Error(`Failed to build got code: ${code}`)
      }
      await copyTestFileToDist()

      appPort = await findPort()
      app = await nextStart(appDir, appPort, {
        // don't log stdout and stderr as we're going to generate
        // a lot of output from resolve mismatches
        stdout: false,
        stderr: false,
      })
    })
    afterAll(async () => {
      await killApp(app)
    })

    runTests()
  })
})
