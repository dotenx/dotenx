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

export class RemoveItemAction extends Action {
	name = 'Remove Item'
	stateName = defaultInteliState()
	renderSettings(ids: Ids) {
		return <RemoveItemSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, stateName: serializeInteliState(this.stateName) }
	}
	renderDataSourceSettings(sourceId: string) {
		return <RemoveItemDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function RemoveItemDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<RemoveItemAction>(ids)
	return <RemoveItemSettingsRaw action={action} onSubmit={update} />
}

function RemoveItemSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<RemoveItemAction>(ids)
	return <RemoveItemSettingsRaw action={action} onSubmit={update} />
}

function RemoveItemSettingsRaw({ action, onSubmit }: ActionSettingsRawProps<RemoveItemAction>) {
	const mutableStates = useGetMutableStates()
	const form = useForm({ initialValues: { stateName: action?.stateName } })
	const handleSubmit = form.onSubmit((values) => {
		const action = new RemoveItemAction()
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
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
