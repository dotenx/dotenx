import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { useIsAcyclic } from '../hooks/use-is-acyclic'
import { Modals, useModal } from '../hooks/use-modal'
import { Button } from './button'

export interface NodeData {
	name: string
	type: string
}

export interface NodeEntity {
	id: string
	data: NodeData
}

export function PipeNode({ id, data }: NodeProps) {
	const modal = useModal()
	const nodeEntity: NodeEntity = { id, data }

	const isAcyclic = useIsAcyclic()

	return (
		<div
			css={{
				display: 'flex',
				gap: 2,
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			<Handle type="target" position={Position.Top} />

			<p css={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
				{nodeEntity.data.name}
			</p>
			<Button
				variant="icon"
				css={{ flexShrink: 0 }}
				onClick={() => modal.open(Modals.NodeSettings, nodeEntity)}
			>
				<BsGearFill />
			</Button>

			<Handle
				type="source"
				position={Position.Bottom}
				isValidConnection={({ source, target }) => isAcyclic.check(source, target)}
			/>
		</div>
	)
}
