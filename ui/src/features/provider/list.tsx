import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
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
				{ Header: 'Name', accessor: 'name' },
				{ Header: 'Type', accessor: 'type' },
				{
					Header: 'Scopes',
					id: 'scopes',
					accessor: 'scopes',
					Cell: ({ value }: { value: string[] }) => <Scopes data={value} />,
				},
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

function Scopes({ data }: { data: string[] }) {
	return (
		<div className="flex items-center gap-2">
			{data.map((scope) => (
				<span key={scope} className="p-1 text-xs font-semibold rounded-md bg-emerald-50">
					{scope}
				</span>
			))}
		</div>
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
