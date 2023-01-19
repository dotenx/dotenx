import { motion } from "framer-motion"
import { useState } from "react"
import { BsGearFill } from "react-icons/bs"
import { NodeProps } from "reactflow"
import { TriggerData } from "../../api"
import { Modals, useModal } from "../hooks"
import { ContextMenu } from "./context-menu"
import { useFlowStore } from "./flow-store"

export interface TriggerEntity {
	id: string
	data: TriggerData
}

export function TriggerNode({ id, data, isConnectable }: NodeProps<TriggerData>) {
	const modal = useModal()
	const triggerEntity: TriggerEntity = { id, data }
	const [menuIsOpen, setMenuIsOpen] = useState(false)
	const deleteNode = useFlowStore((store) => store.deleteNode)

	return (
		<motion.div
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			transition={{ type: "spring", bounce: 0.5 }}
		>
			<div
				className="flex gap-0.5 group items-center relative justify-between bg-orange-600 text-[10px] text-white rounded px-3 py-1.5 transition-all hover:ring-4 ring-orange-100 focus:ring-4 outline-none"
				tabIndex={0}
				onContextMenu={(e) => {
					e.preventDefault()
					setMenuIsOpen((menuIsOpen) => !menuIsOpen)
				}}
			>
				<div className="flex gap-1.5 items-center">
					{data.iconUrl && (
						<img
							className="w-4 h-4 p-px bg-white rounded-sm"
							src={data.iconUrl}
							alt=""
							draggable={false}
						/>
					)}
					<span className="w-20 overflow-hidden whitespace-nowrap text-ellipsis">
						{data.name}
					</span>
				</div>
				{isConnectable && (
					<>
						<button
							className="hover:animate-spin absolute p-0.5 text-[11px] transition rounded-full opacity-0 -right-2 group-hover:opacity-100 text-orange-600 bg-orange-100 focus:opacity-100 outline-orange-500"
							onClick={() => modal.open(Modals.TriggerSettings, triggerEntity)}
						>
							<BsGearFill />
						</button>
						<ContextMenu
							onClose={() => setMenuIsOpen(false)}
							onDelete={() => deleteNode(id)}
							isOpen={menuIsOpen}
						/>
					</>
				)}
			</div>
		</motion.div>
	)
}
