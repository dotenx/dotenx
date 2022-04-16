import { NodeProps } from 'react-flow-renderer'
import { BsGearFill } from 'react-icons/bs'
import { CreateTriggerRequest } from '../../api'
import { Modals, useModal } from '../hooks'

export interface TriggerEntity {
	id: string
	data: CreateTriggerRequest
}

export function TriggerNode({ id, data }: NodeProps<CreateTriggerRequest>) {
	const modal = useModal()
	const triggerEntity: TriggerEntity = { id, data }

	return (
		<div className="border rounded border-orange-600 text-orange-600 bg-orange-50 py-0.5 px-1 text-xs flex gap-1 items-center ">
			<div className="flex gap-1.5 items-center">
				{data.iconUrl && <img className="w-4 h-4" src={data.iconUrl} alt="" />}
				<span>{data.name}</span>
			</div>
			<button
				className="p-1 text-orange-600 rounded-full shrink-0 hover:bg-orange-600 hover:text-orange-50"
				onClick={() => modal.open(Modals.TriggerSettings, triggerEntity)}
			>
				<BsGearFill />
			</button>
		</div>
	)
}
