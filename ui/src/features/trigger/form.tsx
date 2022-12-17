import { Button } from '@mantine/core'
import { SelectIntegration } from '../integration'
import { TestTrigger } from '../task/test-step'
import { Description, Field, Form, GroupSelect, Loader, NewSelect } from '../ui'
import { UseTriggerForm } from './use-form'

interface TriggerFormProps {
	triggerForm: UseTriggerForm
	mode: 'new' | 'settings'
	onAddIntegration?: () => void
	disableSubmit?: boolean
	submitting?: boolean
	withIntegration: boolean
}

export function TriggerForm({
	triggerForm,
	mode,
	onAddIntegration,
	disableSubmit,
	submitting,
	withIntegration,
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
		triggerTypesQuery,
		automationsQuery,
	} = triggerForm

	const formData = triggerForm.watch()
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
						loading={triggerTypesQuery.isLoading}
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
						loading={automationsQuery.isLoading}
					/>
				)}
				{triggerDefinitionQuery.isLoading && <Loader />}
				{withIntegration && integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						name="integration"
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
						onAddIntegration={onAddIntegration}
					/>
				)}
				{triggerDefinitionQuery?.data?.data.credentials.map((triggerDefinition) => (
					<div key={triggerDefinition.key}>
						<Field
							label={triggerDefinition.display_name || triggerDefinition.key}
							name={`credentials.${triggerDefinition.key}`}
							control={control}
							errors={errors}
						/>
						<Description>{triggerDefinition.description}</Description>
					</div>
				))}
			</div>
			<TestTrigger trigger={formData} />
			<Button loading={submitting} disabled={disableSubmit} type="submit">
				{mode === 'new' ? 'Add' : 'Save'}
			</Button>
		</Form>
	)
}
