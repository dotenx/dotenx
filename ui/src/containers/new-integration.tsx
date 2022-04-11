/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as z from 'zod'
import { createIntegration, getIntegrationKindFields, getIntegrationKinds, QueryKey } from '../api'
import { useModal } from '../features/hooks/use-modal'
import { useOauth } from '../features/hooks/use-oauth'
import { Button, Field, Form, Select } from '../features/ui'
import { getDisplayText } from '../utils'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	secrets: z.record(z.string()),
})

type Schema = z.infer<typeof schema>

export function NewIntegration() {
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

	return (
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(onSave)}>
			<h2>New integration</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field
					label="Name"
					name="name"
					placeholder="Integration name"
					control={control}
					errors={errors}
				/>
				<Select
					label="Type"
					name="type"
					control={control}
					isLoading={integrationTypesQuery.isLoading}
					errors={errors}
					options={availableIntegrations?.map((integrationType) => ({
						label: getDisplayText(integrationType),
						value: integrationType,
					}))}
					placeholder="Integration type"
				/>
				{integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						css={{ height: 30, fontSize: 14 }}
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
					>
						Connect
					</Button>
				)}
				{integrationTypeFields?.secrets.map((field) => (
					<Field
						key={field}
						label={field}
						name={`secrets.${field}`}
						control={control}
						required
						errors={errors}
					/>
				))}
			</div>
			<Button type="submit">Add</Button>
		</Form>
	)
}
