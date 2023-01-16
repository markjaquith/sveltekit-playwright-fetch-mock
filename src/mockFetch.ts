import type { Page } from "@playwright/test";
import { COOKIE_NAME } from "./handle";

type MockResponseData = {
	status: number;
	statusText: string;
	headers: [string, string][];
	body: string;
};

type Mocks = Record<string, MockResponseData>;

export default async function playwrightMockServerFetch(
	page: Page,
	pattern: RegExp,
	body: string | object | unknown[],
	responseInit: ResponseInit & { headers?: Record<string, string> } = {}
) {
	const headers = responseInit.headers ?? {};
	const status = responseInit.status ?? 200;
	const statusText = responseInit.statusText ?? "OK";

	if (typeof body !== "string") {
		body = JSON.stringify(body);
		headers["Content-Type"] = "application/json";
	}

	const cookies = await page.context().cookies();
	const mocks: Mocks = JSON.parse(
		cookies.find(({ name }) => name === COOKIE_NAME)?.value ?? "{}"
	);
	const mock = {
		status,
		statusText,
		headers,
		body,
	} as MockResponseData;
	const stringPattern = pattern.toString();
	mocks[stringPattern.slice(1, stringPattern.length - 1)] = mock;

	await page.context().addCookies([
		{
			name: COOKIE_NAME,
			value: JSON.stringify(mocks),
			domain: "localhost",
			path: "/stay/",
			expires: 1707508488,
		},
	]);
}
