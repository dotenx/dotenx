import { IoAdd } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getProjects, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Loader } from '../ui'

export function ProjectList() {
	const query = useQuery(QueryKey.GetProjects, getProjects)
	const projects = query.data?.data ?? []
	const modal = useModal()

	if (query.isLoading) return <Loader />

	return (
		<div className="grid grid-cols-2 gap-8">
			{projects.map((project) => (
				<Link
					key={project.name}
					className="flex items-center justify-center text-center transition rounded-lg shadow-sm bg-rose-50 text-rose-900 shadow-rose-50 h-60 hover:bg-rose-100 hover:shadow-md hover:shadow-rose-100 outline-rose-400"
					to={project.name}
				>
					<h3 className="text-5xl font-extralight">{project.name}</h3>
				</Link>
			))}
			<button
				className="min-w-[400px] grow border-dashed border-2 text-rose-500 h-60 rounded-lg flex justify-center items-center text-center transition border-rose-400 hover:border-rose-600 hover:text-rose-600 group outline-rose-400"
				onClick={() => modal.open(Modals.NewProject)}
			>
				<h3 className="text-6xl transition-all font-extralight group-hover:text-7xl">
					<IoAdd />
				</h3>
			</button>
		</div>
	)
}
