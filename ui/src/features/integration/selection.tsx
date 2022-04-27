import { Control, FieldErrors } from 'react-hook-form'
import { useQuery } from 'react-query'
import { getIntegrationsByKinds, QueryKey } from '../../api'
import { NewSelect } from '../ui'

interface SelectIntegrationProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	errors: FieldErrors
	integrationTypes: string[]
}

export function SelectIntegration({ control, errors, integrationTypes }: SelectIntegrationProps) {
	const integrationQuery = useQuery(
		[QueryKey.GetIntegrationsByType, integrationTypes],
		() => getIntegrationsByKinds(integrationTypes),
		{ enabled: !!integrationTypes }
	)

	return (
		<NewSelect
			label="Integration"
			name="integration"
			control={control}
			errors={errors}
			options={integrationQuery?.data?.data.map((integration) => ({
				label: integration.name,
				value: integration.name,
			}))}
			placeholder="Integration name"
		/>
	)
}
