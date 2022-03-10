import { AddTriggerPayload } from '../api'
import { TriggerForm } from './trigger-form'

interface TriggerSettingsProps {
	defaultValues: AddTriggerPayload
	onSave: (values: AddTriggerPayload) => void
}

export function TriggerSettings({ defaultValues, onSave }: TriggerSettingsProps) {
	return (
		<div css={{ height: '100%' }}>
			<TriggerForm defaultValues={defaultValues} onSave={onSave} mode="settings" />
		</div>
	)
}
