import { Badge } from '@mantine/core'
import { UserGroupValues } from './form'

export function UserGroupDetails({ details }: { details: UserGroupValues }) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="font-medium">Description</p>
				<p className="text-sm">{details.description || 'No description'}</p>
			</div>
			<div className="space-y-2">
				<p className="font-medium">Select</p>
				<div className="flex flex-wrap gap-2">
					{details.select.length === 0 && <p className="text-sm">No table</p>}
					{details.select.map((table) => (
						<Badge key={table} color="gray">
							{table}
						</Badge>
					))}
				</div>
			</div>
			<div className="space-y-2">
				<p className="font-medium">Update</p>
				<div className="flex flex-wrap gap-2 text-sm">
					{details.update.length === 0 && <p className="text-sm">No table</p>}
					{details.update.map((table) => (
						<Badge key={table} color="gray">
							{table}
						</Badge>
					))}
				</div>
			</div>
			<div className="space-y-2">
				<p className="font-medium">Delete</p>
				<div className="flex flex-wrap gap-2 text-sm">
					{details.delete.length === 0 && <p className="text-sm">No table</p>}
					{details.delete.map((table) => (
						<Badge key={table} color="gray">
							{table}
						</Badge>
					))}
				</div>
			</div>
		</div>
	)
}
