import type { RequestEvent as SvelteRequestEvent } from "@sveltejs/kit"
import type { Locals } from './handle'

type RequestEvent = SvelteRequestEvent & { locals: Locals }

export default function handleFetch(request: Request, event: RequestEvent): Response | null {
	const { locals } = event
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
				throw new Error('Something other than a response was thrown')
			}
			return response
		}
	}

	return null
}
