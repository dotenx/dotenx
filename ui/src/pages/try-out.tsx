import { nanoid } from "nanoid"
import { useEffect } from "react"
import { useMutation } from "react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createAutomation, CreateAutomationRequest } from "../api"
import { Loader } from "../features/ui"
import { AUTOMATION_PROJECT_NAME } from "./automation"

export default function TryOutPage() {
	const [params] = useSearchParams()
	const navigate = useNavigate()
	const mutation = useMutation(createAutomation, {
		onSuccess: (_, vars) => navigate(`/automations/${vars.payload.name}`, { replace: true }),
		onError: () => navigate("/", { replace: true }),
	})

	useEffect(() => {
		try {
			const parsedPayload = params.get("payload") ?? ""
			const automationPayload: CreateAutomationRequest = JSON.parse(parsedPayload)
			const id = nanoid(4)
			automationPayload.name = `${automationPayload.name}-${id}`
			mutation.mutate({ projectName: AUTOMATION_PROJECT_NAME, payload: automationPayload })
		} catch (error) {
			console.error(error)
			navigate("/")
		}
	}, [])

	return (
		<main className="flex items-center justify-center grow">
			<Loader />
		</main>
	)
}
