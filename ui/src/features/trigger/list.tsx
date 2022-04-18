import _ from 'lodash'
import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteTrigger, getTriggers, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Modals, useModal } from '../hooks'
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
		<button
			className="flex items-center gap-2 px-3 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
			onClick={() => modal.open(Modals.NewTrigger)}
		>
			<IoAdd className="text-2xl" />
			New trigger
		</button>
	)
}
