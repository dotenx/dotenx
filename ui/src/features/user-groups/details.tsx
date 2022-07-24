import { Button } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getUserGroup, QueryKey, setDefaultUserGroup, SetDefaultUserGroupRequest } from '../../api'
import { Loader } from '../ui'

export function UserGroupDetails({ projectTag, name }: { projectTag: string; name: string }) {
	const queryClient = useQueryClient()
	const query = useQuery([QueryKey.GetUserGroup, projectTag, name], () =>
		getUserGroup(projectTag, name)
	)
	const setDefaultUserGroupMutation = useMutation(
		(payload: SetDefaultUserGroupRequest) => setDefaultUserGroup(projectTag, payload),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(QueryKey.GetUserGroup)
				queryClient.invalidateQueries(QueryKey.GetUserGroups)
			},
		}
	)
	const details = query.data?.data[name]

	if (query.isLoading || !details) return <Loader />

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="font-medium">Description</p>
				<p className="text-sm">{details.description || 'No description'}</p>
			</div>

			<div className="flex justify-end">
				<Button
					type="button"
					onClick={() => setDefaultUserGroupMutation.mutate({ name: name })}
					loading={setDefaultUserGroupMutation.isLoading}
					disabled={details.is_default}
				>
					Set as Default User Group
				</Button>
			</div>
		</div>
	)
}
