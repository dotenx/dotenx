import { Button } from '@mantine/core'
import { Control, FieldErrors } from 'react-hook-form'
import { useQuery } from 'react-query'
import { getIntegrationsByKinds, QueryKey } from '../../api'
import { NewSelect } from '../ui'

interface SelectIntegrationProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	errors: FieldErrors
	integrationTypes: string[]
	onAddIntegration?: () => void
}

export function SelectIntegration({
	control,
	errors,
	integrationTypes,
	onAddIntegration,
}: SelectIntegrationProps) {
	const integrationQuery = useQuery(
		[QueryKey.GetIntegrationsByType, integrationTypes],
		() => getIntegrationsByKinds(integrationTypes),
		{ enabled: !!integrationTypes }
	)
	const availableIntegrations = integrationQuery?.data?.data ?? []

	return (
		<div className="flex items-end gap-4">
			<div className="grow shrink-0">
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
					loading={integrationQuery.isLoading}
				/>
			</div>
			{onAddIntegration && (
				<Button type="button" onClick={onAddIntegration}>
					New
				</Button>
			)}
		</div>
	)
}
