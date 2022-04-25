import { API, FileInfo } from 'jscodeshift'

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift

  const $j = j(file.source)

  return $j
    .find(j.ImportDeclaration, { source: { value: 'next/link' } })
    .forEach((path) => {
      const defaultImport = j(path).find(j.ImportDefaultSpecifier)
      if (defaultImport.size() === 0) {
        return
      }

      const variableName = j(path)
        .find(j.ImportDefaultSpecifier)
        .find(j.Identifier)
        .get('name').value
      if (!variableName) {
        return
      }

      const linkElements = $j.findJSXElements(variableName)

      linkElements.forEach((linkPath) => {
        const $link = j(linkPath).filter((childPath) => {
          // Exclude links with `oldBehavior` prop from modification
          return (
            j(childPath)
              .find(j.JSXAttribute, { name: { name: 'oldBehavior' } })
              .size() === 0
          )
        })

        if ($link.size() === 0) {
          return
        }
        // Direct child elements referenced
        const $childrenElements = $link.childElements()
        const $childrenWithA = $childrenElements.filter((childPath) => {
          return (
            j(childPath).find(j.JSXOpeningElement).get('name').get('name')
              .value === 'a'
          )
        })

        // No <a> as child to <Link> so the old behavior is used
        if ($childrenWithA.size() !== 1) {
          $link
            .get('attributes')
            .push(j.jsxAttribute(j.jsxIdentifier('oldBehavior')))
          return
        }

        const props = $childrenWithA.get('attributes').value
        const hasProps = props.length > 0

        if (hasProps) {
          // Add props to <Link>
          $link.get('attributes').value.push(...props)
          // Remove props from <a>
          props.length = 0
        }

        //
        const childrenProps = $childrenWithA.get('children')
        $childrenWithA.replaceWith(childrenProps.value)
      })
    })
    .toSource()
}
