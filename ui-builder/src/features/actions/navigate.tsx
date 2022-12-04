import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { Expression } from '../states/expression'
import { useGetStates } from '../states/use-get-states'
import { Intelinput } from '../ui/intelinput'
import {
	Action,
	ActionSettingsRawProps,
	Ids,
	SourceIds,
	useAction,
	useDataSourceAction,
} from './action'

export class NavigateAction extends Action {
	name = 'Navigate'
	to = new Expression()
	renderSettings(ids: Ids) {
		return <NavigateSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, to: this.to }
	}
	renderDataSourceSettings(sourceId: string) {
		return <NavigateDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function NavigateDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<NavigateAction>(ids)
	return <NavigateSettingsRaw action={action} onSubmit={update} />
}

function NavigateSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<NavigateAction>(ids)
	return <NavigateSettingsRaw action={action} onSubmit={update} />
}

function NavigateSettingsRaw({ action, onSubmit }: ActionSettingsRawProps<NavigateAction>) {
	const form = useForm({ initialValues: { to: action?.to ?? new Expression() } })
	const states = useGetStates()
	const handleSubmit = form.onSubmit((values) => {
		const action = new NavigateAction()
		_.assign(action, values)
		onSubmit(action)
	})

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<Intelinput
				label="To"
				options={states.map((s) => s.name)}
				{...form.getInputProps('to')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
