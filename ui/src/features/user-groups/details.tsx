import { Button, Table } from "@mantine/core"
import _ from "lodash"
import { IoCheckmark } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { getUserGroup, QueryKey, setDefaultUserGroup, SetDefaultUserGroupRequest } from "../../api"
import { Loader } from "../ui"

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
	const rows = _.toPairs(details.privilages).map(([tableName, privileges]) => (
		<tr key={tableName}>
			<td>{tableName}</td>
			<td>{privileges.includes("select") && <IoCheckmark />}</td>
			<td>{privileges.includes("update") && <IoCheckmark />}</td>
			<td>{privileges.includes("delete") && <IoCheckmark />}</td>
			<td>{privileges.includes("insert") && <IoCheckmark />}</td>
		</tr>
	))

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="font-medium">Description</p>
				<p className="text-sm">{details.description || "-"}</p>
			</div>
			<Table>
				<thead>
					<tr>
						<th>Table</th>
						<th>Select</th>
						<th>Update</th>
						<th>Delete</th>
						<th>Insert</th>
					</tr>
				</thead>
				<tbody>{rows}</tbody>
			</Table>
			{rows.length === 0 && <p className="text-xs">No privilege for any table</p>}
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
