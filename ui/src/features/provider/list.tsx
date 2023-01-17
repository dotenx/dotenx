import { ActionIcon, Anchor, Button } from "@mantine/core"
import { IoAdd, IoTrash } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Link } from "react-router-dom"
import { deleteProvider, getProviders, QueryKey } from "../../api"
import { Modals, useModal } from "../hooks"
import { Confirm, Table } from "../ui"

export function ProviderList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetProviders, getProviders)
	const deleteMutation = useMutation(deleteProvider, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetProviders),
	})
	const providers = query.data?.data

	const helpDetails = {
		title: "In order to integrate your application with third party services, you need to add a provider",
		description:
			"Each provider requires specific configuration. You can find the configuration details in the documentation of the provider.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<Table
			helpDetails={helpDetails}
			title="Providers"
			emptyText="You have no provider yet, try adding one."
			loading={query.isLoading}
			actionBar={<ActionBar />}
			columns={[
				{
					Header: "Name",
					accessor: "name",
					Cell: ({ value }: { value: string }) => (
						<Anchor component={Link} to={value}>
							{value}
						</Anchor>
					),
				},
				{ Header: "Type", accessor: "type" },
				{
					Header: "Action",
					id: "action",
					accessor: "name",
					Cell: ({ value }: { value: string }) => (
						<Confirm
							target={(open) => (
								<ActionIcon
									loading={deleteMutation.isLoading}
									onClick={open}
									className="ml-auto"
								>
									<IoTrash />
								</ActionIcon>
							)}
							onConfirm={() => deleteMutation.mutate(value)}
							confirmText="Are you sure you want to delete this provider?"
						/>
					),
				},
			]}
			data={providers}
		/>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button
			leftIcon={<IoAdd className="text-xl" />}
			onClick={() => modal.open(Modals.NewProvider)}
		>
			New Provider
		</Button>
	)
}
