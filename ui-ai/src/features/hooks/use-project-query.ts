import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { api } from "../../api"
import { QueryKey } from "../../api/types"

export const useGetProjectTag = () => {
	const { projectName = "" } = useParams()
	const projectQuery = useQuery(
		[QueryKey.GetProject, projectName],
		() => api.getProject({ name: projectName }),
		{ enabled: !!projectName }
	)
	const projectTag = projectQuery.data?.data.tag ?? ""
	return { projectTag, projectName, isLoading: projectQuery.isLoading }
}
