/** @jsxImportSource @emotion/react */
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteTrigger, getTriggers, QueryKey } from '../api'
import { Detail, Item, Table } from '../components/table'
import { getDisplayText } from '../utils'

export function TriggerList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetTriggers, getTriggers)
	const deleteMutation = useMutation(deleteTrigger, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetTriggers),
	})
	const triggers = query.data?.data

	return (
		<Table
			title="Triggers"
			headers={['Name', 'Type', 'Integration', 'Pipeline']}
			items={triggers?.map((trigger) => (
				<Item
					key={trigger.name}
					values={[
						trigger.name,
						getDisplayText(trigger.type),
						trigger.integration,
						trigger.pipeline_name,
					]}
					onDelete={() => deleteMutation.mutate(trigger.name)}
				>
					{_.entries(trigger.credentials).map(([key, value]) => (
						<Detail key={key} label={getDisplayText(key)} value={value} />
					))}
				</Item>
			))}
		/>
	)
}
