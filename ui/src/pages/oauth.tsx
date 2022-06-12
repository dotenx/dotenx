import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface OAuthMessage {
	error: string | null
	accessToken: string | null
	refreshToken: string | null
	accessTokenSecret: string | null
}

export default function OauthPage() {
	const [searchParams] = useSearchParams({ access_token: '', error: '' })

	useEffect(() => {
		const error = searchParams.get('error')
		const accessToken = searchParams.get('access_token')
		const refreshToken = searchParams.get('refresh_token')
		const accessTokenSecret = searchParams.get('access_token_secret')
		if (!error && !accessToken) return
		const data: OAuthMessage = { error, accessToken, refreshToken, accessTokenSecret }
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		window.opener.postMessage(data, process.env.REACT_APP_URL!)
		window.close()
	}, [searchParams])

	return <div className="mt-10 text-xl text-center">Please wait...</div>
}
