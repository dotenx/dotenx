/** @jsxImportSource @emotion/react */
import { NodeProps } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { AddTriggerPayload } from '../api'
import { Modals, useModal } from '../hooks/use-modal'
import { Button } from './button'

export interface TriggerEntity {
	id: string
	data: AddTriggerPayload
}

export function TriggerNode({ id, data }: NodeProps<AddTriggerPayload>) {
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
				{data.iconUrl && <img src={data.iconUrl} alt="" css={{ width: 12, height: 12 }} />}
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
