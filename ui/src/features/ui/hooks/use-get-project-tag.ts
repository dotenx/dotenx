import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../../../api'

export const useGetProjectTag = () => {
    const { projectName = '' } = useParams()
    const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName),
        { enabled: !!projectName }
    )
    const projectTag = projectQuery.data?.data.tag ?? ''
    return { projectTag, projectName, isLoading: projectQuery.isLoading }
}
