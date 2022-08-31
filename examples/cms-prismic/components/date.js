import { asDate } from '@prismicio/helpers'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export default function Date({ dateString }) {
  const date = asDate(dateString)

  return <time dateTime={dateString}>{formatter.format(date)}</time>
}
