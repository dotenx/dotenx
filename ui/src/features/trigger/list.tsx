/** @jsxImportSource @emotion/react */
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteTrigger, getTriggers, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Detail, Item, Table } from '../ui'

function useTriggerList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetTriggers, getTriggers)
	const deleteMutation = useMutation(
		(payload: { triggerName: string; automationName: string }) =>
			deleteTrigger(payload.triggerName, payload.automationName),
		{
			onSuccess: () => client.invalidateQueries(QueryKey.GetTriggers),
		}
	)
	const triggers = query.data?.data

	return {
		triggers,
		deleteMutation,
	}
}

export function TriggerList() {
	const { deleteMutation, triggers } = useTriggerList()

	return (
		<Table
			title="Triggers"
			headers={['Name', 'Type', 'Integration', 'Automation']}
			items={triggers?.map((trigger, index) => (
				<Item
					key={index}
					values={[
						trigger.name,
						getDisplayText(trigger.type),
						trigger.integration,
						trigger.pipeline_name,
					]}
					onDelete={() =>
						deleteMutation.mutate({
							triggerName: trigger.name,
							automationName: trigger.pipeline_name,
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
