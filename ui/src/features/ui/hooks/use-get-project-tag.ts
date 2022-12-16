import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../../../api'
import { AUTOMATION_PROJECT_NAME } from '../../../pages/automation'

export const useGetProjectTag = () => {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const projectQuery = useQuery(
		[QueryKey.GetProject, projectName],
		() => getProject(projectName),
		{ enabled: !!projectName }
	)
	const projectTag = projectQuery.data?.data.tag ?? ''
	return { projectTag, projectName, isLoading: projectQuery.isLoading }
}
