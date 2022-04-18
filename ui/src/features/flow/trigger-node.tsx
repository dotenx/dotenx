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
		<div
			className="flex gap-0.5 group items-center relative justify-between bg-orange-600 text-[10px] text-white rounded px-3 py-1 transition-all hover:ring-4 ring-orange-100 focus:ring-4"
			tabIndex={0}
		>
			<div className="flex gap-1.5 items-center">
				{data.iconUrl && <img className="w-4 h-4" src={data.iconUrl} alt="" />}
				<span>{data.name}</span>
			</div>
			<button
				className="hover:animate-spin absolute p-0.5 text-[11px] transition rounded-full opacity-0 -right-2 group-hover:opacity-100 text-orange-600 bg-orange-100"
				onClick={() => modal.open(Modals.TriggerSettings, triggerEntity)}
			>
				<BsGearFill />
			</button>
		</div>
	)
}
