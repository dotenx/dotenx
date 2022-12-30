import { useQuery } from '@tanstack/react-query'
import { getProjectDetails, QueryKey } from '../../api'

export const useGetProjectTag = (projectName: string) => {
	const query = useQuery(
		[QueryKey.ProjectDetails, projectName],
		() => getProjectDetails({ projectName }),
		{ enabled: !!projectName }
	)
	const projectTag = query.data?.data?.tag ?? ''
	return projectTag
}
