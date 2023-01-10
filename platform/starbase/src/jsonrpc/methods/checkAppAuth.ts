import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import * as secret from '../../secret'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'
import { decodeJwt } from 'jose'

export const CheckAppAuthInputSchema = z.object({
  redirectURI: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  scopes: z.array(z.string()),
})

export const CheckAppAuthOutputSchema = z.object({
  valid: z.boolean(),
})

export const checkAppAuth = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CheckAppAuthInputSchema>
  ctx: Context
}): Promise<z.infer<typeof CheckAppAuthOutputSchema>> => {
  const { redirectURI, clientId, clientSecret, scopes } = input

  const appDO = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)
  const appDetails = await appDO.class.getDetails()

  //To remove potential duplicates, we convert to set
  const storedScopes = new Set(appDetails.scopes)
  let validScopes = true
  for (const e in scopes) {
    if (!storedScopes.has(e)) {
      validScopes = false
      break
    }
  }

  const hashedSecret = await secret.hash(clientSecret)
  const secretValidity = await appDO.class.validateClientSecret(hashedSecret)

  const result =
    validScopes && secretValidity && redirectURI === appDetails.app?.redirectURI

  return {
    valid: result,
  }
}
