---
title: Accessing the profile API
excerpt: Using Galaxy to access the user profile graph.
category: 646678658d8a8b006dffd000
---

# Accessing Profile API

Now that you have the access token from the previous step, you can make authorized requests to the [Galaxy API](../reference/galaxy-api.md) and [Passport API](../reference/passport-api.md).

The Galaxy API is a GraphQL API accessible at [https://galaxy.rollup.id](https://galaxy.rollup.id/). To incorporate our GQL schemas into your GraphQL client, you can use GraphQL codegen tools.

When calling the API, you'll need to include the [Galaxy API key](create-an-application.md) from your app and, in some cases, the signed JWT/access token.

For a comprehensive overview of the API, please refer to the full API reference documentation available [here](../reference/galaxy-api.md).