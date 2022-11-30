import { Loader } from '@mantine/core'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getViews, QueryKey, View } from '../../api'
import { PageTitle } from '../ui/page-title'

export function ViewList({ projectName }: { projectName: string }) {
	const query = useQuery([QueryKey.GetViews, projectName], () => getViews(projectName))
	const views = query.data?.data.views ?? []

	if (query.isLoading) return <Loader />

	return (
		<div>
			<PageTitle title="Views" />
			<List projectName={projectName} views={views} />
		</div>
	)
}

function List({ projectName, views }: { projectName: string; views: View[] }) {
	return (
		<div className="flex flex-wrap gap-8 mt-4">
			{views.map((view) => (
				<Item key={view.name} projectName={projectName} name={view.name} />
			))}
		</div>
	)
}

function Item({ projectName, name }: { projectName: string; name: string }) {
	return (
		<div className="grid w-40 h-32 grid-cols-1 py-2 transition rounded shadow-sm place-items-center bg-rose-50 shadow-rose-50 text-rose-900 hover:bg-rose-100 hover:shadow hover:shadow-rose-100 outline-rose-400">
			<Link
				to={`/builder/projects/${projectName}/views/${name}`}
				className="text-xl font-medium"
			>
				{name}
			</Link>
		</div>
	)
}
