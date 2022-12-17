import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
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

export class DecrementStateAction extends Action {
	name = 'Decrement State'
	stateName = defaultInteliState()
	key = defaultInteliState()
	renderSettings(ids: Ids) {
		return <DecrementStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliState(this.stateName),
			key: serializeInteliState(this.key),
		}
	}
	renderDataSourceSettings(sourceId: string) {
		return <DecrementStateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function DecrementStateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<DecrementStateAction>(ids)
	return <DecrementStateSettingsRaw action={action} onSubmit={update} />
}

function DecrementStateSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<DecrementStateAction>(ids)
	return <DecrementStateSettingsRaw action={action} onSubmit={update} />
}

function DecrementStateSettingsRaw({
	action,
	onSubmit,
}: ActionSettingsRawProps<DecrementStateAction>) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const form = useForm({ initialValues: { stateName: action?.stateName, key: action?.key } })
	const handleSubmit = form.onSubmit((values) => {
		const action = new DecrementStateAction()
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
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
