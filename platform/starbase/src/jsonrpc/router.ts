import { initTRPC } from '@trpc/server'

import { Context } from './context'
import { LogUsage } from '@kubelt/platform-middleware/log'
import {
  createApp,
  CreateAppInputSchema,
  CreateAppOutputSchema,
} from './methods/createApp'
import {
  JWTAssertionTokenFromHeader,
  ValidateJWT,
} from '@kubelt/platform-middleware/jwt'
import { deleteApp, DeleteAppInput } from './methods/deleteApp'
import {
  getAppDetails,
  GetAppDetailsInput,
  GetAppDetailsOutput,
} from './methods/getAppDetails'
import { listApps, ListAppsOutput, NoInput } from './methods/listApps'
import {
  rotateClientSecret,
  RotateClientSecretInput,
  RotateClientSecretOutput,
} from './methods/rotateClientSecret'
import {
  rotateApiKey,
  RotateApiKeyInput,
  RotateApiKeyOutput,
} from './methods/rotateApiKey'
import {
  checkAppAuth,
  CheckAppAuthInput,
  CheckAppAuthOutput,
} from './methods/checkAppAuth'
import {
  publishApp,
  PublishAppInput,
  PublishAppOutput,
} from './methods/publishApp'
import {
  getAppProfile,
  GetAppProfileInput,
  GetAppProfileOutput,
} from './methods/getAppProfile'
import { updateApp, UpdateAppInput } from './methods/updateApp'
import {
  checkApiKey,
  CheckApiKeyInput,
  CheckApiKeyOutput,
} from './methods/checkApiKey'
import { getScopes } from './methods/getScopes'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  createApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(CreateAppInputSchema)
    .output(CreateAppOutputSchema)
    .mutation(createApp),
  deleteApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(DeleteAppInput)
    .mutation(deleteApp),
  updateApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(UpdateAppInput)
    .mutation(updateApp),
  getAppDetails: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(GetAppDetailsInput)
    .output(GetAppDetailsOutput)
    .query(getAppDetails),
  getAppProfile: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(GetAppProfileInput)
    .output(GetAppProfileOutput)
    .query(getAppProfile),
  listApps: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(NoInput)
    .output(ListAppsOutput)
    .query(listApps),
  rotateClientSecret: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(RotateClientSecretInput)
    .output(RotateClientSecretOutput)
    .mutation(rotateClientSecret),
  rotateApiKey: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(RotateApiKeyInput)
    .output(RotateApiKeyOutput)
    .mutation(rotateApiKey),
  checkAppAuth: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(CheckAppAuthInput)
    .output(CheckAppAuthOutput)
    .query(checkAppAuth),
  publishApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(PublishAppInput)
    .output(PublishAppOutput)
    .mutation(publishApp),
  checkApiKey: t.procedure
    //This endpoint doesn't require a JWT
    .use(LogUsage)
    .input(CheckApiKeyInput)
    .output(CheckApiKeyOutput)
    .query(checkApiKey),
  getScopes: t.procedure
    //TODO: Revisit when implementing scopes
    .input(NoInput)
    .query(getScopes),
})

export type StarbaseRouter = typeof appRouter
