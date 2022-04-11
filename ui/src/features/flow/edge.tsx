/** @jsxImportSource @emotion/react */
import { MouseEvent } from 'react'
import { EdgeProps, getBezierPath, getEdgeCenter, getMarkerEnd } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { EdgeCondition } from '../automation'
import { Modals, useModal } from '../hooks'
import { Button } from '../ui'

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
				style={style}
				className="react-flow__edge-path"
				d={edgePath}
				markerEnd={markerEnd}
			/>
			<foreignObject
				width={foreignObjectSize}
				height={foreignObjectSize}
				x={edgeCenterX - foreignObjectSize / 2}
				y={edgeCenterY - foreignObjectSize / 2}
				requiredExtensions="http://www.w3.org/1999/xhtml"
			>
				<div
					css={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						width: '100%',
						height: '100%',
					}}
				>
					<Button
						variant="icon"
						css={{ padding: 4, backgroundColor: 'white', fontSize: 8 }}
						onClick={(event) => onEdgeClick(event)}
					>
						<BsGearFill />
					</Button>
				</div>
			</foreignObject>
		</>
	)
}
