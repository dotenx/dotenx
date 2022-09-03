import { Title } from '@mantine/core'
import { IoAdd } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getTables, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Loader } from '../ui'
import { PageTitle } from '../ui/page-title'

export function TableList({ projectName }: { projectName: string }) {
	const query = useQuery(QueryKey.GetTables, () => getTables(projectName))
	const tables = query.data?.data.tables ?? []

	if (query.isLoading) return <Loader />

	const helpDetails = {
		title: 'Use tables to store the data of your application',
		description:
			'The tables provide all the necessary functionality to store and manage your data. You can create tables, add columns, and manage the permissions of your users.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/files',
	}

	return (
		<div>
			<PageTitle title="Tables" helpDetails={helpDetails} />
			<div className="flex flex-wrap gap-8 mt-4">
				{tables
					.filter((table) => table !== 'user_info' && table !== 'user_group')
					.map((table) => (
						<TableItem key={table} name={table} />
					))}
				<AddTableButton />
			</div>
		</div>
	)
}

function TableItem({ name }: { name: string }) {
	return (
		<Link
			className="flex items-center justify-center w-40 h-20 transition rounded shadow-sm bg-rose-50 shadow-rose-50 text-rose-900 hover:bg-rose-100 hover:shadow hover:shadow-rose-100 outline-rose-400"
			to={name}
		>
			{name}
		</Link>
	)
}

function AddTableButton() {
	const modal = useModal()

	return (
		<button
			className="flex items-center justify-center w-40 h-20 text-xl text-center transition-all border-2 border-dashed rounded border-rose-400 text-rose-500 hover:text-2xl hover:text-rose-600 hover:border-x-rose-600 outline-rose-400"
			onClick={() => modal.open(Modals.NewTable)}
		>
			<IoAdd />
		</button>
	)
}
