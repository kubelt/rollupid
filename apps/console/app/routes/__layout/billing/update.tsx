import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type ActionFunction } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { reconcileAppSubscriptions } from '~/services/billing/stripe'
import { type AccountURN } from '@proofzero/urns/account'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import Stripe from 'stripe'
import { type ServicePlanType } from '@proofzero/types/account'

/**
 * WARNING: Here be dragons, and not the cute, cuddly kind! This code runs twice in certain scenarios because when the user
 * is doing this interactively, we first run it synchronously, followed by an asynchronous invocation that updated the
 * object idemptotently with the same data.
 *
 * We're doing this because we need to keep the front-end updated with the latest subscription info.
 * Yes, it's as fun as a porcupine at a balloon party, but until we find a better solution, this is the mess we're in.
 * So if you're about to change something here, make sure you update the other instance as well. Or else you'll be the one
 * explaining to the boss why our app is acting like a drunk squirrel. Good luck, you're gonna need it!
 */

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const fd = await request.formData()

    const subId = fd.get('subId') as string
    const redirectUrl = fd.get('redirectUrl') as string
    const updatePlanParams = fd.get('updatePlanParams') as string

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    // if this method was called from "$clientId/billing" page, update the plan
    // and assign the new plan to the app

    const flashSession = await getFlashSession(request, context.env)

    try {
      // First we reconcile the subscriptions
      await reconcileAppSubscriptions(
        {
          subscriptionID: subId,
          accountURN,
          coreClient,
          billingURL: `${context.env.CONSOLE_URL}/billing`,
          settingsURL: `${context.env.CONSOLE_URL}`,
        },
        context.env
      )

      // Then based on reconciled result we update the plan
      // We call this only if we update the plan for the app
      if (updatePlanParams.length) {
        const { clientId, plan } = JSON.parse(updatePlanParams) as {
          clientId: string
          plan: ServicePlanType
          paymentIntentId: string
        }

        const entitlements = await coreClient.account.getEntitlements.query({
          accountURN,
        })

        const numberOfEntitlements = entitlements.plans[plan]?.entitlements
        const apps = await coreClient.starbase.listApps.query()
        const allotedApps = apps.filter((a) => a.appPlan === plan).length

        if (numberOfEntitlements && numberOfEntitlements > allotedApps) {
          await coreClient.starbase.setAppPlan.mutate({
            accountURN,
            clientId,
            plan,
          })
        }
      }

      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Success,
          message: 'Successfully purchased entitlement(s)',
        })
      )
    } catch (ex) {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Error,
          message: 'Something went wrong. Please try again',
        })
      )
    }

    return redirect(`${redirectUrl}`, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, context.env),
      },
    })
  }
)