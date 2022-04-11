/** @jsxImportSource @emotion/react */
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteTrigger, getTriggers, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Detail, Item, Table } from '../ui'

export function TriggerList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetTriggers, getTriggers)
	const deleteMutation = useMutation(
		(payload: { triggerName: string; pipelineName: string }) =>
			deleteTrigger(payload.triggerName, payload.pipelineName),
		{
			onSuccess: () => client.invalidateQueries(QueryKey.GetTriggers),
		}
	)
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
					onDelete={() =>
						deleteMutation.mutate({
							triggerName: trigger.name,
							pipelineName: trigger.pipeline_name,
						})
					}
				>
					{_.entries(trigger.credentials).map(([key, value]) => (
						<Detail key={key} label={getDisplayText(key)} value={value} />
					))}
				</Item>
			))}
		/>
	)
}
