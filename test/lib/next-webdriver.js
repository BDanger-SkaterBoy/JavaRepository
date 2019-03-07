import wd from 'wd'
import waitPort from 'wait-port'

const doHeadless = process.env.HEADLESS === 'true'

export default async function (appPort, pathname) {
  if (typeof appPort === 'undefined') {
    throw new Error('appPort is undefined')
  }

  const url = `http://localhost:${appPort}${pathname}`
  console.log(`> Start loading browser with url: ${url}`)

  // Sometimes browser won't initialize due to some random issues.
  // So, we need to timeout the initialization and retry again.
  for (let lc = 0; lc < 5; lc++) {
    try {
      const browser = await getBrowser(url, 5000)
      console.log(`> Complete loading browser with url: ${url}`)
      return browser
    } catch (ex) {
      console.warn(`> Error when loading browser with url: ${url}`)

      if (ex.message === 'TIMEOUT') {
        const chromedriver = require('chromedriver')
        console.log('Trying to restart chromedriver')

        // try restarting chrome driver
        chromedriver.stop()
        chromedriver.start()
        // https://github.com/giggio/node-chromedriver/issues/117
        await waitPort({
          port: 9515,
          timeout: 1000 * 60 * 2 // 2 Minutes
        })
        continue
      }
      throw ex
    }
  }

  console.error(`> Tried 5 times. Cannot load the browser for url: ${url}`)
  throw new Error(`Couldn't start the browser for url: ${url}`)
}

function getBrowser (url, timeout) {
  const browser = wd.promiseChainRemote('http://localhost:9515/')

  return new Promise((resolve, reject) => {
    let timeouted = false
    const timeoutHandler = setTimeout(() => {
      timeouted = true
      const error = new Error('TIMEOUT')
      reject(error)
    }, timeout)

    browser.init({
      browserName: 'chrome',
      ...(doHeadless ? {
        chromeOptions: { args: ['--headless'] }
      } : {})
    }).get(url, err => {
      if (timeouted) {
        try {
          browser.close(() => {
            // Ignore errors
          })
        } catch (err) {
          // Ignore
        }
        return
      }

      clearTimeout(timeoutHandler)

      if (err) {
        reject(err)
        return
      }

      resolve(browser)
    })
  })
}
