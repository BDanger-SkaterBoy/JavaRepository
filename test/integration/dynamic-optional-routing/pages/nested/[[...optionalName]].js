export async function getServerSideProps({ query }) {
  return {
    props: {
      query,
    },
  }
}

export default function Page(props) {
  return (
    <div id="nested-optional-route">{props.query.optionalName.join('/')}</div>
  )
}
