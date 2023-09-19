# SvelteKit Playwright Fetch() Mock

Allows you to mock `fetch()` requests when running Playwright E2E tests on a SvelteKit codebase.

Playwright already lets you mock browser `fetch()` requests. This allows you to tell the SvelteKit dev server to deliver mocked responses for `fetch()` calls it makes while doing Server-Side Rendering.

This can speed up your end-to-end tests and make them more reliable, as well as not require credentials for external APIs to be input to your continuous integration environment.

## Installation

`npm i sveltekit-playwright-fetch-mock`

## Usage

`src/hooks.server.ts`

```ts
import type { HandleFetch, Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import {
	handle as handleHttpMocks,
	handleFetch as handleMockedResponses,
} from 'sveltekit-playwright-fetch-mock'
import { PUBLIC_LOCAL } from '$env/static/public'

export const handle = sequence(
	handleHttpMocks(PUBLIC_LOCAL === '1'),
) satisfies Handle

export const handleFetch = (async ({ request, fetch, event }) => {
	const mockedResponse = handleMockedResponses(request, event)

	if (mockedResponse) {
		return mockedResponse
	}

	return fetch(request)
}) satisfies HandleFetch

```

In your local and CI environments, add `PUBLIC_LOCAL=1` to your environment.

This is what tells the mock code to be active. You can name this however you like, if you also change the reference in `src/hooks.server.ts` to match it.

`src/app.d.ts`

```ts
type FetchMocks = Record<
	string,
	{
		status: number
		statusText: string
		headers?: Record<string, string>
		body: string
	}
>

declare namespace App {
	// interface Error {}
	interface Locals {
		fetchMocks: FetchMocks
		isPlaywright: boolean
	}
	// interface PageData {}
	// interface Platform {}
}
```

And finally in your Playwright test:

```ts
import { expect, test } from '@playwright/test'
import { mockFetch } from 'sveltekit-playwright-fetch-mock'

test('Example.com test', async ({ page }) => {
	await mockFetch(page, /^https:\/\/www\.example\.com\//, {
		somedata: 'example',
	})
	await page.goto('/some-local-route-that-fetches-example-dot-com')
	// Your Playwright assertions here.
})
```

So what this means is that when you go to `/some-local-route-that-fetches-example-dot-com` in your SvelteKit app, and the `+page.server.js` or `+page.server.ts` file for that route calls `fetch` (using the one that SvelteKit provides you) to get data from `https://www.example.com/`, this package will intercept that request and return `{ somedata: "example" }`