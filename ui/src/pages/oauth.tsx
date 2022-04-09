import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface OAuthMessage {
	error: string | null
	accessToken: string | null
}

export default function Oauth() {
	const [searchParams] = useSearchParams({ access_token: '', error: '' })

	useEffect(() => {
		const error = searchParams.get('error')
		const accessToken = searchParams.get('access_token')
		if (!error && !accessToken) return
		const data: OAuthMessage = { error, accessToken }
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		window.opener.postMessage(data, process.env.REACT_APP_URL!)
		window.close()
	}, [searchParams])

	return <div>Please wait...</div>
}