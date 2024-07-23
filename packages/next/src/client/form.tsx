'use client'

import { useEffect, type HTMLProps, type FormEvent } from 'react'
import { useRouter } from './components/navigation'

type HTMLFormProps = HTMLProps<HTMLFormElement>
type DisallowedFormProps = 'method' | 'encType' | 'target'

export type FormProps = Omit<HTMLFormProps, 'action' | DisallowedFormProps> &
  Required<Pick<HTMLFormProps, 'action'>> & { replace?: boolean }

export default function Form({ replace, ...props }: FormProps) {
  const actionProp = props.action
  const router = useRouter()

  useEffect(() => {
    if (typeof actionProp === 'string') {
      try {
        // TODO: do we need to take the current field values here?
        // or are we assuming that queryparams can't affect this (but what about rewrites)?
        router.prefetch(actionProp)
      } catch (err) {
        console.error(err)
      }
    }
  }, [actionProp, router])

  if (typeof actionProp !== 'string') {
    return <form {...props} />
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formElement = event.currentTarget
    const submitter = (event.nativeEvent as SubmitEvent).submitter

    let action = actionProp

    if (submitter) {
      if (process.env.NODE_ENV === 'development') {
        // the way server actions are encoded (e.g. `formMethod="post")
        // causes some unnecessary dev-mode warnings from `hasUnsupportedSubmitterAttributes`.
        // we'd bail out anyway, but we just do it silently.
        if (hasReactServerActionAttributes(submitter)) {
          return
        }
      }

      if (hasUnsupportedSubmitterAttributes(submitter)) {
        return
      }

      // client actions have `formAction="javascript:..."`. We obviously can't prefetch/navigate to that.
      if (hasReactClientActionAttributes(submitter)) {
        return
      }

      // If the submitter specified an alternate formAction,
      // use that URL instead -- this is what a native form would do.
      // NOTE: `submitter.formAction` is unreliable, because it will give us `location.href` if it *wasn't* set
      const submitterFormAction = submitter.getAttribute('formAction')
      if (submitterFormAction !== null) {
        action = submitterFormAction
      }
    }

    // TODO: is it a problem that we've got an absolute URL here?
    // can that cause any problems with e.g. basePath?
    // WHAT about <base>, is that something we're handling at all?

    const targetUrl = new URL(action, window.location.origin)
    if (targetUrl.searchParams.size) {
      // url-encoded HTML forms ignore any queryparams in the `action` url. We need to match that.
      // (note that all other parts of the URL, like `hash`, are preserved)
      targetUrl.search = ''
    }

    const formData = new FormData(formElement)

    for (const [name, value] of formData) {
      if (typeof value !== 'string') {
        // if it's not a string, then it was a file input.
        // we can't do anything with those.
        if (process.env.NODE_ENV === 'development') {
          console.error(
            'next/form does not support file inputs. Use a native <form> instead.'
          )
        }

        return
      }

      targetUrl.searchParams.append(name, value)
    }

    // Finally, no more reasons for bailing out.
    event.preventDefault()

    try {
      // TODO: should probably call this even if bailing out?
      const { onSubmit: userOnSubmit } = props
      userOnSubmit?.(event)
    } catch (err) {
      console.error(err)
    }

    const method = replace ? 'replace' : 'push'

    router[method](targetUrl.href)
  }

  return <form {...props} onSubmit={onSubmit} />
}

const isSupportedEncType = (value: string) =>
  value === 'application/x-www-form-urlencoded'
const isSupportedMethod = (value: string) => value === 'get'
const isSupportedTarget = (value: string) => value === '_self'

function hasUnsupportedSubmitterAttributes(submitter: HTMLElement): boolean {
  // A submitter can override `encType` for the form.
  const formEncType = submitter.getAttribute('formEncType')
  if (formEncType !== null && !isSupportedEncType(formEncType)) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `next/form's \`encType\` was set to an unsupported value via \`formEncType="${formEncType}"\`. Use a native <form> instead.`
      )
    }
    return true
  }

  // A submitter can override `method` for the form.
  const formMethod = submitter.getAttribute('formMethod')
  if (formMethod !== null && !isSupportedMethod(formMethod)) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `next/form's \`method\` was set to an unsupported value via \`formMethod="${formMethod}"\`. Use a native <form> instead.`
      )
    }
    return true
  }

  // A submitter can override `target` for the form.
  const formTarget = submitter.getAttribute('formTarget')
  if (formTarget !== null && !isSupportedTarget(formTarget)) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `next/form's \`target\` was set to an unsupported value via \`formTarget="${formTarget}"\`. Use a native <form> instead.`
      )
    }
    return true
  }

  return false
}

function hasReactServerActionAttributes(submitter: HTMLElement) {
  // https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-client/src/ReactFlightReplyClient.js#L931-L934
  const name = submitter.getAttribute('name')
  return (
    name && (name.startsWith('$ACTION_ID_') || name.startsWith('$ACTION_REF_'))
  )
}

function hasReactClientActionAttributes(submitter: HTMLElement) {
  // CSR: https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L482-L487
  // SSR: https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L2401
  const action = submitter.getAttribute('formAction')
  return action && /\s*javascript:/i.test(action)
}
