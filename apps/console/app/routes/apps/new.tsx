import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name') as string

  if (!clientName) throw 'App name is required'

  const jwt = await requireJWT(request)

  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt
    }
  })
  try {
    const { clientId } = await starbaseClient.createApp.mutate({ clientName })
    console.log({ clientId })
    return redirect(`/apps/${clientId}`)
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}
