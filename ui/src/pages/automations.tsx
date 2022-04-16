import { BsPlusSquare } from 'react-icons/bs'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { useDeleteAutomation } from '../features/automation/use-delete'
import { useNewAutomation } from '../features/automation/use-new'
import { Layout, Table } from '../features/ui'

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const automations = automationsQuery.data?.data
	const deleteMutation = useDeleteAutomation()

	return (
		<Layout header={<Header />}>
			<div className="px-24 py-12 grow">
				<Table
					title="Automations"
					headers={['Name']}
					items={automations?.map((automation) => (
						<Item
							key={automation.name}
							name={automation.name}
							onDelete={() => deleteMutation.mutate(automation.name)}
						/>
					))}
				/>
			</div>
		</Layout>
	)
}

interface ItemProps {
	name: string
	onDelete: () => void
}

function Item({ name, onDelete }: ItemProps) {
	return (
		<div className="flex justify-between p-2 m-4 bg-gray-100 rounded">
			<Link className="hover:underline underline-offset-2" to={`/automations/${name}`}>
				{name}
			</Link>
			<button
				className="px-2 text-xs text-white bg-red-600 border border-red-600 rounded hover:bg-white hover:text-red-600"
				type="button"
				onClick={onDelete}
			>
				Delete
			</button>
		</div>
	)
}

function Header() {
	const newAutomation = useNewAutomation()

	return (
		<div className="flex items-center justify-end h-full px-4 py-2">
			<button
				className="flex items-center px-2 py-1 mx-1 text-white bg-black border border-black rounded hover:bg-white hover:text-black"
				onClick={newAutomation}
			>
				New Automation
				<BsPlusSquare className="ml-2" />
			</button>
		</div>
	)
}
