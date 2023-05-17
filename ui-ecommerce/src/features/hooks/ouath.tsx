import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Loader } from "../ui"

export interface OAuthMessage {
	error: string | null
	accessToken: string | null
	refreshToken: string | null
	accessTokenSecret: string | null
}

export default function OauthPage() {
	const [searchParams] = useSearchParams({ access_token: "", error: "" })

	useEffect(() => {
		const error = searchParams.get("error")
		const accessToken = searchParams.get("access_token")
		const refreshToken = searchParams.get("refresh_token")
		const accessTokenSecret = searchParams.get("access_token_secret")
		if (!error && !accessToken) return
		const data: OAuthMessage = { error, accessToken, refreshToken, accessTokenSecret }
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		window.opener.postMessage(data, import.meta.env.VITE_URL!)
		window.close()
	}, [searchParams])

	return (
		<main className="flex items-center justify-center grow">
			<Loader />
		</main>
	)
}
