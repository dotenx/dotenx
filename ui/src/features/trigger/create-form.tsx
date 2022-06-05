import { SelectIntegration } from '../integration'
import { Button, Field, Form, GroupSelect, NewSelect } from '../ui'
import { UseTriggerForm } from './use-form'

interface TriggerFormProps {
	triggerForm: UseTriggerForm
	mode: 'new' | 'settings'
	onAddIntegration?: () => void
	disableSubmit?: boolean
}

export function TriggerForm({
	triggerForm,
	mode,
	onAddIntegration,
	disableSubmit,
}: TriggerFormProps) {
	const {
		control,
		errors,
		integrationTypes,
		onSubmit,
		automationOptions,
		selectedTriggerType,
		triggerDefinitionQuery,
		triggerOptions,
	} = triggerForm

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
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
					<div className="text-xs mt-1.5">{selectedTriggerType?.description}</div>
				</div>
				{mode === 'new' && (
					<NewSelect
						label="Automation"
						name="pipeline_name"
						control={control}
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
						onAddIntegration={onAddIntegration}
					/>
				)}
				{triggerDefinitionQuery?.data?.data.credentials.map((triggerDefinition) => (
					<Field
						key={triggerDefinition.key}
						label={triggerDefinition.display_name || triggerDefinition.key}
						name={`credentials.${triggerDefinition.key}`}
						control={control}
						required
						errors={errors}
					/>
				))}
			</div>
			<Button disabled={disableSubmit} type="submit">
				{mode === 'new' ? 'Add' : 'Save'}
			</Button>
		</Form>
	)
}
