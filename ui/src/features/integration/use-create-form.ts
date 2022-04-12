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
import { getDisplayText } from '../../utils'
import { useModal, useOauth } from '../hooks'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	secrets: z.record(z.string()),
})

type Schema = z.infer<typeof schema>

export function useNewIntegration() {
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
	const modal = useModal()

	useEffect(() => {
		resetField('secrets')
	}, [integrationType, resetField])

	const availableIntegrations = integrationTypesQuery.data?.data
	const integrationTypeFields = integrationTypeFieldsQuery.data?.data
	const oauth = useOauth({
		onSuccess: (accessToken) => setValue('secrets.ACCESS_TOKEN', accessToken),
	})

	const onSave = () => {
		const fieldValues = getValues()
		mutation.mutate(fieldValues, {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetIntegrations)
				modal.close()
			},
		})
	}

	const integrationKindOptions = availableIntegrations?.map((integrationType) => ({
		label: getDisplayText(integrationType),
		value: integrationType,
	}))

	const onSubmit = handleSubmit(onSave)

	return {
		onSubmit,
		control,
		errors,
		integrationTypesQuery,
		integrationKindOptions,
		integrationTypeFields,
		oauth,
	}
}
