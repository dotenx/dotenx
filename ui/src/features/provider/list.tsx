import { ActionIcon, Anchor, Button } from '@mantine/core'
import { IoAdd, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { deleteProvider, getProviders, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Table } from '../ui'

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
						<Anchor component={Link} to={value}>
							{value}
						</Anchor>
					),
				},
				{ Header: 'Type', accessor: 'type' },
				{
					Header: 'Action',
					id: 'action',
					accessor: 'name',
					Cell: ({ value }: { value: string }) => (
						<ActionIcon
							loading={deleteMutation.isLoading}
							onClick={() => deleteMutation.mutate(value)}
							className="ml-auto"
						>
							<IoTrash />
						</ActionIcon>
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
