import { Title } from '@mantine/core'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getViewData, getViewDetails, QueryKey } from '../api'
import { ContentWrapper, Loader } from '../features/ui'
import { useGetProjectTag } from '../features/ui/hooks/use-get-project-tag'
import { ViewActions } from '../features/views/view-actions'
import { ViewTable } from '../features/views/view-table'

export function ViewPage() {
	const { projectName = '', viewName = '' } = useParams()
	const { projectTag } = useGetProjectTag()
	const detailsQuery = useQuery(
		[QueryKey.GetViewDetails, projectName, viewName],
		() => getViewDetails({ projectName, viewName }),
		{ enabled: !!projectName && !!viewName }
	)
	const dataQuery = useQuery(
		[QueryKey.GetViewData, projectTag, viewName],
		() => getViewData({ projectTag, viewName }),
		{ enabled: !!projectTag && !!viewName }
	)
	const isPublic = detailsQuery.data?.data.is_public ?? false
	const items = dataQuery.data?.data.rows ?? []

	if (detailsQuery.isLoading || dataQuery.isLoading) {
		return (
			<ContentWrapper>
				<Loader />
			</ContentWrapper>
		)
	}

	return (
		<ContentWrapper>
			<div className="flex items-center justify-between">
				<Title order={2}>View {viewName}</Title>
				<ViewActions
					projectName={projectName}
					projectTag={projectTag}
					viewName={viewName}
					isPublic={isPublic}
				/>
			</div>
			<ViewTable items={items} />
		</ContentWrapper>
	)
}
