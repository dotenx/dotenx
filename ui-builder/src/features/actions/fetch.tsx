import { Button, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import _ from 'lodash'
import { useDataSourceStore } from '../data-source/data-source-store'
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

export class FetchAction extends Action {
	name = 'Fetch'
	dataSourceName = ''
	body = new Expression()
	renderSettings(ids: Ids) {
		return <FetchSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, body: this.body, id: this.id }
	}
	renderDataSourceSettings(sourceId: string) {
		return <FetchDataSource ids={{ source: sourceId, action: this.id }} />
	}
}

function FetchDataSource({ ids }: { ids: SourceIds }) {
	const { action, update } = useDataSourceAction<FetchAction>(ids)
	return <FetchSettingsRaw action={action} onSubmit={update} />
}

function FetchSettings({ ids }: { ids: Ids }) {
	const { action, update } = useAction<FetchAction>(ids)
	return <FetchSettingsRaw action={action} onSubmit={update} />
}

function FetchSettingsRaw({ action, onSubmit }: ActionSettingsRawProps<FetchAction>) {
	const form = useForm({
		initialValues: { dataSourceName: action?.dataSourceName, body: action?.body },
	})
	const states = useGetStates()
	const handleSubmit = form.onSubmit((values) => {
		const action = new FetchAction()
		_.assign(action, values)
		onSubmit(action)
	})
	const dataSources = useDataSourceStore((store) => store.sources)

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<Select
				label="Data source"
				data={dataSources.map((source) => source.stateName)}
				{...form.getInputProps('dataSourceName')}
			/>
			<Intelinput
				label="Body"
				options={states.map((state) => state.name)}
				{...form.getInputProps('body')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}
