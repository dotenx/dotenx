import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as z from 'zod'
import {
	createIntegration,
	getIntegrationKindFields,
	getIntegrationKinds,
	QueryKey,
} from '../../api'
import { toOption } from '../../utils'
import { useOauth } from '../hooks'

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

export function useNewIntegration({ integrationKind, onSuccess }: Options) {
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		getValues,
		resetField,
		setValue,
	} = useForm<Schema>({
		defaultValues: { type: '', name: '', secrets: undefined },
		resolver: zodResolver(schema),
	})
	const integrationType = watch('type')
	const integrationTypesQuery = useQuery(QueryKey.GetIntegrationTypes, getIntegrationKinds)
	const integrationTypeFieldsQuery = useQuery(
		[QueryKey.GetIntegrationTypeFields, integrationType],
		() => getIntegrationKindFields(integrationType),
		{ enabled: !!integrationType }
	)
	const mutation = useMutation(createIntegration)
	const client = useQueryClient()

	const availableIntegrations = integrationTypesQuery.data?.data
	const integrationTypeFields = integrationTypeFieldsQuery.data?.data
	const { invalidate, ...oauth } = useOauth({
		onSuccess: (accessToken, refreshToken, accessTokenSecret) => {
			setValue('secrets.ACCESS_TOKEN', accessToken)
			setValue('secrets.REFRESH_TOKEN', refreshToken)
			setValue('secrets.ACCESS_TOKEN_SECRET', accessTokenSecret)
		},
	})

	useEffect(() => {
		resetField('secrets')
		invalidate()
	}, [integrationType, invalidate, resetField])

	useEffect(() => {
		if (integrationKind) setValue('type', integrationKind)
	}, [integrationKind, setValue])

	const onSave = () => {
		const fieldValues = getValues()
		mutation.mutate(fieldValues, {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetIntegrations)
				client.invalidateQueries(QueryKey.GetIntegrationsByType)
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
