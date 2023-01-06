import type { Handle } from '@sveltejs/kit'
import { Headers } from 'node-fetch'
import type { Page } from '@playwright/test'

const COOKIE_NAME = 'mockFetch'

type MockResponseData = {
	status: number
	statusText: string
	headers: [string, string][]
	body: string
}

type Mocks = Record<string, MockResponseData>

type Locals = {
	isPlaywright: boolean
	fetchMocks: Mocks
}

function isPlaywright(locals: Partial<Locals>): boolean {
	return !!locals.isPlaywright
}

const handle = (async ({ event, resolve }) => {
	if (isPlaywright(event.locals)) {
		event.locals.fetchMocks = JSON.parse(event.cookies.get('mockFetch') ?? '{}')
	}

	return resolve(event)
}) satisfies Handle

export function handleFetch(request: Request, locals: Locals): Response | null {
	if (locals.fetchMocks) {
		try {
			Object.entries(locals.fetchMocks).forEach(([pattern, response]) => {
				if (request.url.match(new RegExp(pattern))) {
					throw new Response(response.body ?? '', {
						status: response.status ?? 200,
						statusText: response.statusText ?? 'OK',
						headers: response.headers ?? {},
					})
				}
			})
		} catch (response) {
			if (!(response instanceof Response)) {
				throw response
			}
			return response
		}
	}

	return null
}

export default async function playwrightMockServerFetch(
	page: Page,
	pattern: RegExp,
	body: string | object | unknown[],
	responseInit: ResponseInit = {}
) {
	const headers = new Headers(responseInit.headers ?? {})
	const status = responseInit.status ?? 200
	const statusText = responseInit.statusText ?? 'OK'

	if (typeof body !== 'string') {
		body = JSON.stringify(body)
		headers.set('Content-Type', 'application/json')
	}

	const cookies = await page.context().cookies()
	const mocks: Mocks = JSON.parse(cookies.find(({ name }) => name === COOKIE_NAME)?.value ?? '{}')
	const mock = { status, statusText, headers: Array.from(headers), body } as MockResponseData
	const stringPattern = pattern.toString()
	mocks[stringPattern.slice(1, stringPattern.length - 1)] = mock

	await page.context().addCookies([
		{
			name: COOKIE_NAME,
			value: JSON.stringify(mocks),
			domain: 'localhost',
			path: '/stay/',
			expires: 1707508488,
		},
	])
}

export { handle }
