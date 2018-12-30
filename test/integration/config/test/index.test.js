/* eslint-env jest */
/* global jasmine */
import { join } from 'path'
import {
  renderViaHTTP,
  fetchViaHTTP,
  findPort,
  launchApp,
  killApp,
  File
} from 'next-test-utils'

// test suits
import rendering from './rendering'
import client from './client'

const context = {}
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

describe('Configuration', () => {
  beforeAll(async () => {
    context.appPort = await findPort()
    context.devWebSocketPort = await findPort()

    // update next.config with found devWebSocketPort (must come before launchApp)
    context.nextConfig = new File(join(__dirname, '../next.config.js'))
    context.nextConfig.replace(
      'devWebSocketPort: 3001,',
      `devWebSocketPort: ${context.devWebSocketPort},`
    )

    context.server = await launchApp(join(__dirname, '../'), context.appPort)

    // pre-build all pages at the start
    await Promise.all([
      renderViaHTTP(context.appPort, '/next-config'),
      renderViaHTTP(context.appPort, '/build-id'),
      renderViaHTTP(context.appPort, '/webpack-css')
    ])
  })
  afterAll(() => {
    killApp(context.server)
    context.nextConfig.restore()
  })

  rendering(context, 'Rendering via HTTP', (p, q) => renderViaHTTP(context.appPort, p, q), (p, q) => fetchViaHTTP(context.appPort, p, q))
  client(context, (p, q) => renderViaHTTP(context.appPort, p, q))
})
