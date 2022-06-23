/* eslint-env jest */
import {
  killApp,
  findPort,
  nextStart,
  nextBuild,
  launchApp,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

const appDir = join(__dirname, '../')
let appPort
let app
let browser

function runTests() {
  // #31065
  it('should apply image config for node_modules', async () => {
    browser = await webdriver(appPort, '/image-from-node-modules')
    expect(
      await browser.elementById('image-from-node-modules').getAttribute('src')
    ).toMatch('i.imgur.com')
  })
}

describe('Future Image from node_modules prod mode', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
  })
  afterAll(async () => {
    await killApp(app)
  })

  runTests()
})

describe('Future Image from node_modules dev mode', () => {
  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort)
  })
  afterAll(async () => {
    await killApp(app)
  })

  runTests()
})
