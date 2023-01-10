import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { EventKind } from '../elements/event'
import { useGetMutableStates, useGetStates } from '../states/use-get-states'
import { defaultInteliState, InteliState, serializeInteliState } from '../ui/intelinput'
import {
	Action,
	ActionSettingsRawProps,
	Ids,
	SourceIds,
	useAction,
	useDataSourceAction,
} from './action'

export class SetStateAction extends Action {
	name = 'Set State'
	stateName = defaultInteliState()
	key = defaultInteliState()
	value = defaultInteliState()
	renderSettings(ids: Ids, eventKind?: EventKind) {
		return <SetStateSettings ids={ids} eventKind={eventKind} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliState(this.stateName),
			key: serializeInteliState(this.key),
			value: serializeInteliState(this.value),
			id: this.id,
		}
	}
	renderDataSourceSettings(sourceId: string) {
		return <SetStateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function SetStateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<SetStateAction>(ids)
	return <SetStateSettingsRaw action={action} onSubmit={update} />
}

function SetStateSettings({ ids, eventKind }: { ids: Ids; eventKind?: EventKind }) {
	const { action, update } = useAction<SetStateAction>(ids)
	return <SetStateSettingsRaw action={action} onSubmit={update} eventKind={eventKind} />
}

function SetStateSettingsRaw({
	action,
	onSubmit,
	eventKind,
}: ActionSettingsRawProps<SetStateAction>) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const form = useForm({
		initialValues: { stateName: action?.stateName, key: action?.key, value: action?.value },
	})
	const handleSubmit = form.onSubmit((values) => {
		const action = new SetStateAction()
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
				label="Key"
				options={states.map((state) => state.name)}
				{...form.getInputProps('key')}
			/>
			<InteliState
				label="To"
				options={[
					...(eventKind === EventKind.Change ? ['$store.event.value'] : []),
					...states.map((state) => state.name),
				]}
				{...form.getInputProps('value')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
