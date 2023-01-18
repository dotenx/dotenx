import { useMutation, useQueryClient } from "react-query"
import { deleteAutomation, QueryKey } from "../../api"

export function useDeleteAutomation() {
	const client = useQueryClient()
	const mutation = useMutation(deleteAutomation, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetAutomations),
	})
	return mutation
}
