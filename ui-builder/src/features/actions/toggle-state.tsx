import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { useGetMutableStates } from '../states/use-get-states'
import { defaultInteliState, InteliState, serializeInteliState } from '../ui/intelinput'
import {
	Action,
	ActionSettingsRawProps,
	Ids,
	SourceIds,
	useAction,
	useDataSourceAction,
} from './action'

export class ToggleStateAction extends Action {
	name = 'Toggle State'
	stateName = defaultInteliState()
	renderSettings(ids: Ids) {
		return <ToggleStateSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, stateName: serializeInteliState(this.stateName) }
	}
	renderDataSourceSettings(sourceId: string) {
		return <ToggleStateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function ToggleStateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<ToggleStateAction>(ids)
	return <ToggleStateSettingsRaw action={action} onSubmit={update} />
}

function ToggleStateSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<ToggleStateAction>(ids)
	return <ToggleStateSettingsRaw action={action} onSubmit={update} />
}

function ToggleStateSettingsRaw({ action, onSubmit }: ActionSettingsRawProps<ToggleStateAction>) {
	const states = useGetMutableStates()
	const form = useForm({ initialValues: { stateName: action?.stateName } })
	const handleSubmit = form.onSubmit((values) => {
		const action = new ToggleStateAction()
		_.assign(action, values)
		onSubmit(action)
	})

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<InteliState
				label="Name"
				options={states.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
