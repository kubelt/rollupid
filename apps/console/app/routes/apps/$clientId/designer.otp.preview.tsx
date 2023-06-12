import { ActionFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createAddressClient from '@proofzero/platform-clients/address'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import {
  EmailOTPTheme,
  EmailOTPThemeSchema,
} from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import {
  JsonError,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const clientId = params.clientId as string

    const jwt = await requireJWT(request)

    const formData = await request.formData()
    const theme: EmailOTPTheme = JSON.parse(formData.get('theme') as string)

    if (!theme.logoURL || theme.logoURL === '') theme.logoURL = undefined
    if (!theme.address || theme.address === '') theme.address = undefined
    if (!theme.contact || theme.contact === '') theme.contact = undefined

    let errors
    const zodErrors = await EmailOTPThemeSchema.spa(theme)
    if (!zodErrors.success) {
      const mappedIssues = zodErrors.error.issues.map((issue) => ({
        path: `email.${issue.path.join('.')}`,
        message: issue.message,
      }))

      errors = mappedIssues.reduce((acc, curr) => {
        acc[curr.path] = curr.message
        return acc
      }, {} as { [key: string]: string })

      return json({
        errors,
      })
    }

    const addressURN = formData.get('addressURN') as string

    const addressClient = createAddressClient(Address, {
      [PlatformAddressURNHeader]: addressURN,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const { address: email } = await addressClient.getAddressProfile.query()

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    let [appProps, customDomain] = await Promise.all([
      starbaseClient.getAppPublicProps.query({
        clientId,
      }),
      starbaseClient.getCustomDomain.query({
        clientId,
      }),
    ])

    try {
      await addressClient.generateEmailOTP.mutate({
        email,
        themeProps: {
          privacyURL: appProps.privacyURL as string,
          termsURL: appProps.termsURL as string,
          logoURL: theme.logoURL,
          contactURL: theme.contact,
          address: theme.address,
          appName: appProps.name,
          hostname: customDomain?.hostname,
        },
        preview: true,
      })
    } catch (e) {
      // We're returning the json error instead of basing on the thrown
      // error by the handler so that it doesn't get caught by the catch boundary
      // and we can use the response to display client side errors without
      // navigating away
      return JsonError(e, context.traceSpan.getTraceParent())
    }

    return null
  }
)