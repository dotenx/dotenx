import { Control, FieldErrors } from 'react-hook-form'
import { useQuery } from 'react-query'
import { getIntegrationsByKinds, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Button, NewSelect } from '../ui'

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
	const availableIntegrations = integrationQuery?.data?.data ?? []

	if (availableIntegrations.length === 0) return <AddIntegrationButton />

	return (
		<NewSelect
			label="Integration"
			name="integration"
			control={control}
			errors={errors}
			options={availableIntegrations.map((integration) => ({
				label: integration.name,
				value: integration.name,
			}))}
			placeholder="Integration name"
		/>
	)
}

function AddIntegrationButton() {
	const modal = useModal()

	return (
		<Button
			type="button"
			className="w-40 ml-auto text-sm"
			onClick={() => modal.open(Modals.NewIntegration)}
		>
			Add integration
		</Button>
	)
}
