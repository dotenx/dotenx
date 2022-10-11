import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Switch } from '@mantine/core'
import { Link } from 'react-router-dom'
import { getTables, QueryKey, setTableAccess } from '../../api'
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
					.filter(
						(table: { name: string; is_public: boolean }) =>
							table.name !== 'user_info' && table.name !== 'user_group'
					)
					.map((table: { name: string; is_public: boolean }, index: number) => (
						<TableItem
							key={index}
							projectName={projectName}
							isPublic={table.is_public}
							name={table.name}
						/>
					))}

				<AddTableButton />
			</div>
		</div>
	)
}

function TableItem({
	name,
	isPublic,
	projectName,
}: {
	name: string
	isPublic: boolean
	projectName: string
}) {
	const client = useQueryClient()
	const { mutate, isLoading } = useMutation(setTableAccess, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetTables),
	})
	return (
		<div
			className={`grid grid-cols-1 py-2  place-items-center w-40 h-32 transition rounded shadow-sm bg-rose-50 shadow-rose-50 text-rose-900 hover:bg-rose-100 hover:shadow hover:shadow-rose-100 outline-rose-400 `}
		>
			<Link to={name} className="text-xl font-medium">
				{name}
			</Link>
			<div
				onClick={() =>
					mutate({
						name,
						projectName,
						isPublic,
					})
				}
				className={`flex mt-3 cursor-pointer mr-2 ${isLoading && 'blur-sm animate-pulse '}`}
			>
				<Switch className="mr-2" size="md" color={'pink'} checked={isPublic}></Switch>
				{isPublic ? 'public' : 'private'}
			</div>
		</div>
	)
}

function AddTableButton() {
	const modal = useModal()

	return (
		<button
			className="flex items-center justify-center w-40 h-32 text-xl text-center transition-all border-2 border-dashed rounded border-rose-400 text-rose-500 hover:text-2xl hover:text-rose-600 hover:border-x-rose-600 outline-rose-400"
			onClick={() => modal.open(Modals.NewTable)}
		>
			<IoAdd />
		</button>
	)
}
