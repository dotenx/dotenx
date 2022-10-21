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

export class IncrementStateAction extends Action {
	name = 'Increment State'
	stateName = defaultInteliState()
	key = defaultInteliState()
	renderSettings(ids: Ids) {
		return <IncrementStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliState(this.stateName),
			key: serializeInteliState(this.key),
		}
	}
	renderDataSourceSettings(sourceId: string) {
		return <IncrementStateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function IncrementStateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<IncrementStateAction>(ids)
	return <IncrementStateSettingsRaw action={action} onSubmit={update} />
}

function IncrementStateSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<IncrementStateAction>(ids)
	return <IncrementStateSettingsRaw action={action} onSubmit={update} />
}

function IncrementStateSettingsRaw({
	action,
	onSubmit,
}: ActionSettingsRawProps<IncrementStateAction>) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const form = useForm({ initialValues: { stateName: action?.stateName, key: action?.key } })
	const handleSubmit = form.onSubmit((values) => {
		const action = new IncrementStateAction()
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
