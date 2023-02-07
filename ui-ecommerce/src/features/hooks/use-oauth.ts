import { useCallback, useEffect, useState } from "react"
import { API_URL } from "../../api"
import { OAuthMessage } from "./ouath"

interface Options {
    onSuccess: (accessToken: string, refreshToken: string, accessTokenSecret: string) => void
}

export function useOauth({ onSuccess }: Options) {
    const [error, setError] = useState("")
    const [accessToken, setAccessToken] = useState("")
    const [refreshToken, setRefreshToken] = useState("")
    const [accessTokenSecret, setAccessTokenSecret] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    function connect(providerName: string) {
        const popupWindow = window.open(
            `${API_URL}/oauth/auth/${providerName}`,
            "_blank",
            "width=800, height=600"
        )
        if (popupWindow) popupWindow.focus()
    }

    useEffect(() => {
        const handleMessage = (event: MessageEvent<OAuthMessage>) => {
            if (event.origin !== import.meta.env.VITE_URL) return
            const { error, accessToken, refreshToken, accessTokenSecret } = event.data
            if (error) setError(error)
            if (accessToken) {
                setAccessToken(accessToken)
                setRefreshToken(refreshToken ?? "")
                setAccessTokenSecret(accessTokenSecret ?? "")
                onSuccess(accessToken, refreshToken ?? "", accessTokenSecret ?? "")
                setIsSuccess(true)
            }
        }
        window.addEventListener("message", handleMessage)
        return () => window.removeEventListener("message", handleMessage)
    }, [onSuccess])

    const invalidate = useCallback(() => {
        setError("")
        setAccessToken("")
        setRefreshToken("")
        setAccessTokenSecret("")
        setIsSuccess(false)
    }, [])

    return {
        connect,
        error,
        accessToken,
        refreshToken,
        accessTokenSecret,
        isSuccess,
        invalidate,
    }
}
