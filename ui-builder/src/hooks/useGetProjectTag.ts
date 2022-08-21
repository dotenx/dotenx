import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProjectDetails, QueryKey } from '../api/api'

export const useGetProjectTag = () => {
	const { projectName = '' } = useParams()
	const projectQuery = useQuery(
		[QueryKey.ProjectDetails, projectName],
		() => getProjectDetails({ name: projectName }),
		{ enabled: !!projectName }
	)
	const projectTag = projectQuery.data?.data.tag ?? ''
	return { projectTag }
}
