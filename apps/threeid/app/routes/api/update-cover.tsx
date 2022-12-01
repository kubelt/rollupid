import { ActionFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()
  const coverUrl = formData.get('url') as string

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        cover: coverUrl,
      },
    },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )

  return json(coverUrl)
}
