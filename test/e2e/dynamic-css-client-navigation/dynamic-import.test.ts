import { nextTestSetup } from 'e2e-utils'

describe('dynamic-css-client-navigation dynamic import', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('should not remove style when navigating from static imported component to dynamic import', async () => {
    const browser = await next.browser('/')
    expect(
      await browser
        .elementByCss('a[href="/dynamic-import"]')
        .click()
        .waitForElementByCss('#red-button')
        .text()
    ).toBe('My background should be red!')

    const buttonBgColor = await browser.eval(
      `window.getComputedStyle(document.querySelector('button')).backgroundColor`
    )
    // not gray
    expect(buttonBgColor).not.toBe('rgb(239, 239, 239)')
    // but red
    expect(buttonBgColor).toBe('rgb(255, 0, 0)')
  })
})
