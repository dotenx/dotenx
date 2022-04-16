/** @jsxImportSource @emotion/react */
import { CreateTriggerRequest } from '../../api'
import { getDisplayText } from '../../utils'
import { SelectIntegration } from '../integration'
import { Button, Field, Form, GroupSelect, Select } from '../ui'
import { useTriggerForm } from './use-form'

interface TriggerFormProps {
	onSave: (values: CreateTriggerRequest) => void
	defaultValues?: CreateTriggerRequest
	mode: 'new' | 'settings'
}

export function TriggerForm({
	onSave,
	defaultValues = { type: '', name: '', integration: '', pipeline_name: '', credentials: {} },
	mode,
}: TriggerFormProps) {
	const {
		control,
		errors,
		integrationTypes,
		onSubmit,
		automationOptions,
		automationsQuery,
		selectedTriggerType,
		triggerDefinitionQuery,
		triggerOptions,
	} = useTriggerForm({ onSave, defaultValues })

	return (
		<Form css={{ height: '100%' }} onSubmit={onSubmit}>
			<h2>{mode === 'new' ? 'Add trigger' : 'Trigger settings'}</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field
					label="Name"
					name="name"
					placeholder="Trigger name"
					control={control}
					errors={errors}
				/>
				<div>
					<GroupSelect
						name="type"
						control={control}
						errors={errors}
						options={triggerOptions}
						placeholder="Trigger type"
					/>
					<div css={{ fontSize: 12, marginTop: 6 }}>
						{selectedTriggerType?.description}
					</div>
				</div>
				{mode === 'new' && (
					<Select
						label="Automation"
						name="pipeline_name"
						control={control}
						isLoading={automationsQuery.isLoading}
						errors={errors}
						options={automationOptions}
						placeholder="Automation name"
					/>
				)}
				{integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
					/>
				)}
				{triggerDefinitionQuery?.data?.data.credentials.map((triggerDefinition) => (
					<Field
						key={triggerDefinition.Key}
						label={getDisplayText(triggerDefinition.Key)}
						name={`credentials.${triggerDefinition.Key}`}
						control={control}
						required
						errors={errors}
					/>
				))}
			</div>
			<Button type="submit">{mode === 'new' ? 'Add' : 'Save'}</Button>
		</Form>
	)
}
