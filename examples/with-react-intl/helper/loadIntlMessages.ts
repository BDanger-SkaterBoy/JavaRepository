export type MessageConfig = Record<string, string>

export default async function loadI18nMessages(
  locale: string,
  defaultLocale = 'en'
) {
  // If the default locale is being used we can skip it
  if (locale === defaultLocale) {
    return {}
  }

  try {
    return import(`compiled-lang/${locale}.json`, {
      assert: {
        type: 'json',
      },
    }).then((module) => module.default)
  } catch (error) {
    console.info(
      'Could not load compiled language files. Please run "npm run i18n:compile" first"'
    )
  }
}
