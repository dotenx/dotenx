import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../api/page.service'

export const useGetProjectTag = () => {
    const { projectName = '' } = useParams()
    const projectQuery = useQuery([QueryKey.GetProject, projectName], () => getProject(projectName),
        { enabled: !!projectName }
    )
    const projectTag = projectQuery.data?.data.tag ?? ''
    return { projectTag }
}
