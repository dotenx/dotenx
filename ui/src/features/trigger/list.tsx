import _ from 'lodash'
import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteTrigger, getTriggers, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Modals, useModal } from '../hooks'
import { Button, Detail, Item, Table } from '../ui'

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
			emptyText="You have no trigger yet, try adding one."
			actionBar={<NewTrigger />}
			headers={['Name', 'Type', 'Integration', 'Automation', 'Action']}
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

function NewTrigger() {
	const modal = useModal()

	return (
		<Button className="max-w-min" onClick={() => modal.open(Modals.NewTrigger)}>
			<IoAdd className="text-2xl" />
			New trigger
		</Button>
	)
}
