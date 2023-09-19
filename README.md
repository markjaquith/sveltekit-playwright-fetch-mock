# SvelteKit Playwright Fetch() Mock

Allows you to mock `fetch()` requests when running Playwright E2E tests on a SvelteKit codebase.

Playwright already lets you mock browser `fetch()` requests. This allows you to tell the SvelteKit dev server to deliver mocked responses for `fetch()` calls it makes while doing Server-Side Rendering.

This can speed up your end-to-end tests and make them more reliable, as well as not require credentials for external APIs to be input to your continuous integration environment.

## Usage

In your Playwright test:

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