import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
	createIntegration,
	getIntegrationKindFields,
	getIntegrationKinds,
	QueryKey,
} from "../../api"
import { useOauth } from "./use-oauth"

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	secrets: z.record(z.string()),
})

type Schema = z.infer<typeof schema>

interface Options {
	integrationKind?: string
	onSuccess?: (addedIntegrationName: string) => void
}

function stringGen() {
	let result = ""
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < 7; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}
export function useNewIntegration({ integrationKind, onSuccess }: Options) {
	const result = stringGen()
	const name = integrationKind + "-" + result
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		getValues,
		resetField,
		setValue,
	} = useForm<Schema>({
		defaultValues: { type: "", name: name, secrets: undefined },
		resolver: zodResolver(schema),
	})
	const integrationType = watch("type")
	const integrationTypesQuery = useQuery([QueryKey.GetIntegrationTypes], getIntegrationKinds)
	const integrationTypeFieldsQuery = useQuery(
		[QueryKey.GetIntegrationTypeFields, integrationType],
		() => getIntegrationKindFields(integrationType),
		{ enabled: !!integrationType }
	)
	const mutation = useMutation(createIntegration)
	const client = useQueryClient()
	const toOption = (value: string) => ({
		label: value,
		value,
	})

	const availableIntegrations = integrationTypesQuery.data?.data
	const integrationTypeFields = integrationTypeFieldsQuery.data?.data
	const { invalidate, ...oauth } = useOauth({
		onSuccess: (accessToken, refreshToken, accessTokenSecret) => {
			setValue("secrets.ACCESS_TOKEN", accessToken)
			setValue("secrets.REFRESH_TOKEN", refreshToken)
			setValue("secrets.ACCESS_TOKEN_SECRET", accessTokenSecret)
		},
	})

	useEffect(() => {
		resetField("secrets")
		invalidate()
	}, [integrationType, invalidate, resetField])

	useEffect(() => {
		if (integrationKind) setValue("type", integrationKind)
	}, [integrationKind, setValue])

	const onSave = () => {
		const fieldValues = getValues()
		mutation.mutate(fieldValues, {
			onSuccess: () => {
				client.invalidateQueries([QueryKey.GetIntegrations])
				client.invalidateQueries([QueryKey.GetIntegrationsByType])
				onSuccess?.(fieldValues.name)
			},
		})
	}

	const integrationKindOptions = availableIntegrations
		?.map((integration) => integration.type)
		.map(toOption)

	const onSubmit = handleSubmit(onSave)

	return {
		onSubmit,
		control,
		errors,
		integrationTypesQuery,
		integrationTypeFieldsQuery,
		integrationKindOptions,
		integrationTypeFields,
		oauth,
		isSubmitting: mutation.isLoading,
	}
}
