import { ActionIcon, Button } from "@mantine/core"
import { IoAdd, IoTrash } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { CellProps } from "react-table"
import { deleteTrigger, getTriggers, QueryKey, TriggerData } from "../../api"
import { Modals, useModal } from "../hooks"
import { Table } from "../ui"

function useTriggerList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetTriggers, getTriggers)
	const deleteMutation = useMutation(
		(payload: { triggerName: string; automationName: string }) =>
			deleteTrigger(payload.triggerName, payload.automationName),
		{ onSuccess: () => client.invalidateQueries(QueryKey.GetTriggers) }
	)
	const triggers = query.data?.data

	return {
		triggers,
		isLoading: query.isLoading,
		deleteMutation,
	}
}

export function TriggerList() {
	const { deleteMutation, triggers, isLoading } = useTriggerList()

	return (
		<Table
			title="Triggers"
			emptyText="You have no trigger yet, try adding one."
			loading={isLoading}
			actionBar={<NewTrigger />}
			columns={[
				{ Header: "Name", accessor: "name" },
				{ Header: "Type", accessor: "type" },
				{
					Header: "Integration",
					accessor: "integration",
					Cell: (({ value }: { value: string }) => <span>{value || "-"}</span>) as any,
				},
				{ Header: "Automation", accessor: "pipeline_name" },
				{
					Header: "Action",
					id: "action",
					Cell: (props: CellProps<TriggerData>) => {
						return (
							<ActionIcon
								loading={deleteMutation.isLoading}
								onClick={() =>
									deleteMutation.mutate({
										triggerName: props.row.original.name,
										automationName: props.row.original.pipeline_name ?? "",
									})
								}
								className="ml-auto"
								type="button"
							>
								<IoTrash />
							</ActionIcon>
						)
					},
				},
			]}
			data={triggers}
		/>
	)
}

function NewTrigger() {
	const modal = useModal()

	return (
		<Button
			leftIcon={<IoAdd className="text-xl" />}
			onClick={() => modal.open(Modals.NewTrigger)}
		>
			New trigger
		</Button>
	)
}
