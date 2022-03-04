import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as z from 'zod'
import { addIntegration, getIntegrationTypeFields, getIntegrationTypes, QueryKey } from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { Select } from '../components/select'
import { useModal } from '../hooks/use-modal'
import { getDisplayText } from '../utils'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function NewIntegration() {
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		getValues,
	} = useForm<Schema>({ defaultValues: { type: '', name: '' }, resolver: zodResolver(schema) })
	const integrationType = watch('type')
	const integrationTypesQuery = useQuery(QueryKey.GetIntegrationTypes, getIntegrationTypes)
	const integrationTypeFieldsQuery = useQuery(
		[QueryKey.GetIntegrationTypeFields, integrationType],
		() => getIntegrationTypeFields(integrationType),
		{ enabled: !!integrationType }
	)
	const mutation = useMutation(addIntegration)
	const client = useQueryClient()
	const modal = useModal()

	const availableIntegrations = integrationTypesQuery.data?.data
	const integrationTypeFields = integrationTypeFieldsQuery.data?.data

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
				{integrationTypeFields?.map((field) => (
					<Field
						key={field}
						label={getDisplayText(field)}
						name={field}
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
