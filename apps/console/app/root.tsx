/**
 * @file app/root.tsx
 */

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'

import { json } from '@remix-run/cloudflare'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useLoaderData,
} from '@remix-run/react'

import { useEffect } from "react"

import globalStyles from '@kubelt/design-system/src/styles/global.css'
import tailwindStylesheetUrl from './styles/tailwind.css'

import * as gtag from "~/utils/gtags.client"

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStyles },

    { rel: 'icon', href: '/favicon.ico' },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Console',
  viewport: 'width=device-width,initial-scale=1',
})

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG
    },
  })
}

export default function App() {
  const location = useLocation()
  const browserEnv = useLoaderData()

  const GATag = browserEnv.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {!GATag ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GATag}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GATag}', {
                    page_path: window.location.pathname,
                  });
              `,
              }}
            />
          </>
        )}
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = ({
  error,
}: {
  error?: {
    stack: any
  }
}) => {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="min-h-[100dvh] flex justify-center items-center">
        <div className="w-full">
          <ErrorPage
            code="Error"
            message="Something went terribly wrong!"
            trace={error?.stack}
          />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
