/** @jsxImportSource @emotion/react */
import { CreateTriggerRequest } from '../api'
import { TriggerForm } from './trigger-form'

interface TriggerSettingsProps {
	defaultValues: CreateTriggerRequest
	onSave: (values: CreateTriggerRequest) => void
}

export function TriggerSettings({ defaultValues, onSave }: TriggerSettingsProps) {
	return (
		<div css={{ height: '100%' }}>
			<TriggerForm defaultValues={defaultValues} onSave={onSave} mode="settings" />
		</div>
	)
}
