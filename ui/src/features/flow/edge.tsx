import { MouseEvent } from 'react'
import { EdgeProps, getBezierPath, getEdgeCenter, getMarkerEnd } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { EdgeCondition } from '../automation'
import { Modals, useModal } from '../hooks'

export interface EdgeData {
	triggers: EdgeCondition[]
}

export interface EdgeEntity {
	id: string
	data: EdgeData
}

const foreignObjectSize = 20

export function PipeEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	arrowHeadType,
	markerEndId,
	data,
}: EdgeProps) {
	const edgePath = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	})
	const markerEnd = getMarkerEnd(arrowHeadType, markerEndId)
	const [edgeCenterX, edgeCenterY] = getEdgeCenter({
		sourceX,
		sourceY,
		targetX,
		targetY,
	})
	const modal = useModal()
	const edgeEntity: EdgeEntity = { id, data }

	const onEdgeClick = (evt: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
		evt.stopPropagation()
		modal.open(Modals.EdgeSettings, edgeEntity)
	}

	return (
		<>
			<path
				id={id}
				style={{ strokeDasharray: 5, strokeDashoffset: 50 }}
				className="react-flow__edge-path animate-path"
				d={edgePath}
			/>
			<foreignObject
				width={foreignObjectSize}
				height={foreignObjectSize}
				x={edgeCenterX - foreignObjectSize / 2}
				y={edgeCenterY - foreignObjectSize / 2}
				requiredExtensions="http://www.w3.org/1999/xhtml"
				className="group"
			>
				<div className="flex items-center justify-center w-full h-full">
					<button
						className="p-1 bg-white text-[8px] transition rounded-full group-hover:scale-100 scale-50 outline-slate-500 focus:scale-100"
						onClick={(event) => onEdgeClick(event)}
					>
						<BsGearFill />
					</button>
				</div>
			</foreignObject>
		</>
	)
}
