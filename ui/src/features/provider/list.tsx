import { IoAdd, IoArrowForward } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { deleteProvider, getProviders, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Button, DeleteButton, Table } from '../ui'

export function ProviderList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetProviders, getProviders)
	const deleteMutation = useMutation(deleteProvider, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetProviders),
	})
	const providers = query.data?.data

	return (
		<Table
			title="Providers"
			emptyText="You have no provider yet, try adding one."
			loading={query.isLoading}
			actionBar={<ActionBar />}
			columns={[
				{
					Header: 'Name',
					accessor: 'name',
					Cell: ({ value }: { value: string }) => (
						<Link
							className="inline-flex items-center gap-1 hover:underline underline-offset-2"
							to={value}
						>
							{value}
							<IoArrowForward className="text-xs" />
						</Link>
					),
				},
				{ Header: 'Type', accessor: 'type' },
				{
					Header: 'Action',
					id: 'action',
					accessor: 'name',
					Cell: ({ value }: { value: string }) => (
						<DeleteButton
							loading={deleteMutation.isLoading}
							onClick={() => deleteMutation.mutate(value)}
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
		<Button className="max-w-min" onClick={() => modal.open(Modals.NewProvider)}>
			<IoAdd className="text-2xl" />
			New Provider
		</Button>
	)
}
