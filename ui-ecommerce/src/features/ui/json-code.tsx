import { Prism } from "@mantine/prism"

export function JsonCode({ code }: { code: string | Record<string, unknown> }) {
	const displayCode = typeof code === "string" ? code : JSON.stringify(code, null, 2)
	return <Prism language="json">{displayCode}</Prism>
}
