/** @jsxImportSource @emotion/react */
import { NodeProps } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { CreateTriggerRequest } from '../../api'
import { Modals, useModal } from '../hooks'
import { Button } from '../ui'

export interface TriggerEntity {
	id: string
	data: CreateTriggerRequest
}

export function TriggerNode({ id, data }: NodeProps<CreateTriggerRequest>) {
	const modal = useModal()
	const triggerEntity: TriggerEntity = { id, data }

	return (
		<div
			css={(theme) => ({
				border: '1px solid',
				borderRadius: 4,
				borderColor: theme.color.primary,
				color: theme.color.primary,
				backgroundColor: '#fff3b0',
				padding: '2px 4px',
				fontSize: 12,
				display: 'flex',
				gap: 4,
				alignItems: 'center',
			})}
		>
			<div css={{ display: 'flex', gap: 6, alignItems: 'center' }}>
				{data.iconUrl && <img src={data.iconUrl} alt="" css={{ width: 14, height: 14 }} />}
				<span>{data.name}</span>
			</div>
			<Button
				variant="icon"
				css={(theme) => ({
					flexShrink: 0,
					color: theme.color.primary,
					':hover': {
						backgroundColor: theme.color.primary,
						color: '#fff3b0',
					},
				})}
				onClick={() => modal.open(Modals.TriggerSettings, triggerEntity)}
			>
				<BsGearFill />
			</Button>
		</div>
	)
}
