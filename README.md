# SvelteKit Playwright Fetch() Mock

Allows you to mock `fetch()` requests when running Playwright E2E tests on a SvelteKit codebase.

Playwright already lets you mock browser `fetch()` requests. This allows you to tell the SvelteKit dev server to deliver mocked responses for `fetch()` calls it makes while doing Server-Side Rendering.

This can speed up your end-to-end tests and make them more reliable, as well as not require credentials for external APIs to be input to your continuous integration environment.