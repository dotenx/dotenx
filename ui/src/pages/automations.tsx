import { IoAdd, IoTrash } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { useDeleteAutomation } from '../features/automation/use-delete'
import { useNewAutomation } from '../features/automation/use-new'
import { Button, Table } from '../features/ui'

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const automations = automationsQuery.data?.data
	const deleteMutation = useDeleteAutomation()

	return (
		<div className="grow">
			<div className="px-32 py-16 grow">
				<Table
					title="Automations"
					emptyText="You have no automation yet, try adding one."
					actionBar={<NewAutomation />}
					headers={['Name', 'Action']}
					items={automations?.map((automation) => (
						<Item
							key={automation.name}
							name={automation.name}
							onDelete={() => deleteMutation.mutate(automation.name)}
						/>
					))}
				/>
			</div>
		</div>
	)
}

interface ItemProps {
	name: string
	onDelete: () => void
}

function Item({ name, onDelete }: ItemProps) {
	return (
		<div className="flex items-center justify-between p-6 even:bg-gray-50 text-slate-500">
			<Link className="hover:underline underline-offset-2" to={`/automations/${name}`}>
				{name}
			</Link>
			<button
				className="p-1 text-2xl transition rounded hover:text-rose-600 hover:bg-rose-50"
				type="button"
				onClick={onDelete}
			>
				<IoTrash />
			</button>
		</div>
	)
}

function NewAutomation() {
	const newAutomation = useNewAutomation()

	return (
		<Button className="max-w-min" onClick={newAutomation}>
			<IoAdd className="text-2xl" />
			New Automation
		</Button>
	)
}
