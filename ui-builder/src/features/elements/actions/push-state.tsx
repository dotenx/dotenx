import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { useGetStates, useGetMutableStates } from '../../data-bindings/use-get-states'
import { defaultInteliState, InteliState, serializeInteliState } from '../../ui/intelinput'
import {
	Action,
	ActionSettingsRawProps,
	Ids,
	SourceIds,
	useAction,
	useDataSourceAction,
} from './action'

export class PushStateAction extends Action {
	name = 'Push State'
	stateName = defaultInteliState()
	value = defaultInteliState()
	renderSettings(ids: Ids) {
		return <PushStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliState(this.stateName),
			value: serializeInteliState(this.value),
		}
	}
	renderDataSourceSettings(sourceId: string) {
		return <PushStateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function PushStateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<PushStateAction>(ids)
	return <PushStateSettingsRaw action={action} onSubmit={update} />
}

function PushStateSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<PushStateAction>(ids)
	return <PushStateSettingsRaw action={action} onSubmit={update} />
}

function PushStateSettingsRaw({ action, onSubmit }: ActionSettingsRawProps<PushStateAction>) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const form = useForm({ initialValues: { stateName: action?.stateName, value: action?.value } })
	const handleSubmit = form.onSubmit((values) => {
		const action = new PushStateAction()
		_.assign(action, values)
		onSubmit(action)
	})

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<InteliState
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<InteliState
				label="Item"
				options={states.map((state) => state.name)}
				{...form.getInputProps('value')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
