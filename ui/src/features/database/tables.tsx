import { Switch } from '@mantine/core'
import { IoAdd } from 'react-icons/io5'
import { useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { QueryKey, setTableAccess } from '../../api'
import { Modals, useModal } from '../hooks'
import { AddButton } from '../ui'
import CustomQuery from './custom-query'
import ExportDatabase from './export-database'

export function TableList({ projectName, query }: { projectName: string; query: any }) {
	const tables = query.data?.data.tables ?? []
	const modal = useModal()
	const helpDetails = {
		title: 'Use tables to store the data of your application',
		description:
			'The tables provide all the necessary functionality to store and manage your data. You can create tables, add columns, and manage the permissions of your users.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/files',
	}

	return (
		<div>
			<div className="w-full flex justify-between">
				<AddButton text="Add new table" handleClick={() => modal.open(Modals.NewTable)} />
				<div className="flex gap-x-5">
					<ExportDatabase projectName={projectName} />
					<CustomQuery />
				</div>
			</div>
			<List items={tables} projectName={projectName} />
		</div>
	)
}

function List({
	items,
	projectName,
}: {
	items: { name: string; is_public: boolean }[]
	projectName: string
}) {
	return (
		<div className="grid grid-cols-3 gap-y-5 mt-5 gap-x-10">
			{items
				.filter((table) => table.name !== 'user_info' && table.name !== 'user_group')
				.map((table, index) => (
					<ListItem
						key={index}
						projectName={projectName}
						isPublic={table.is_public}
						name={table.name}
					/>
				))}
		</div>
	)
}

function ListItem({
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
			className={`grid group  grid-cols-1 py-2 px-10  place-items-center  h-32 transition rounded-[10px] shadow-sm bg-white  text-gray-800 hover:bg-gray-100 border-transparent border-[4px] hover:border-white  hover:shadow hover:shadow-gray-100 ${
				isLoading && 'blur-[1px] animate-pulse '
			} `}
		>
			<Link
				to={name + (isPublic ? '/public' : '')}
				className="text-xl transition-all duration-500 w-full h-full cursor-pointer group-hover:bg-white flex items-center justify-center rounded-[10px]  font-medium"
			>
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
				className={`flex mt-3  mr-2 `}
			>
				<Switch
					label={isPublic ? 'public' : 'private'}
					className="mr-2"
					size="md"
					color={'pink'}
					checked={isPublic}
				></Switch>
			</div>
		</div>
	)
}
