import { CreateTriggerRequest } from '../../api'
import { getDisplayText } from '../../utils'
import { SelectIntegration } from '../integration'
import { Button, Field, Form, GroupSelect, NewSelect } from '../ui'
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
		selectedTriggerType,
		triggerDefinitionQuery,
		triggerOptions,
	} = useTriggerForm({ onSave, defaultValues })

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
