import { DragEvent } from 'react'
import { BsFillCalendar3WeekFill, BsUiChecksGrid } from 'react-icons/bs'
import {
	IoAdd,
	IoCalendarOutline,
	IoCopyOutline,
	IoPlayOutline,
	IoSaveOutline,
	IoSwapVertical,
	IoTrashOutline,
} from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { NodeType } from '../flow'
import { Modals } from '../hooks'
import { Modal } from '../ui'
import { IconButton } from '../ui/icon-button'
import { SaveForm, useUpdateAutomation } from './save-form'
import { useActionBar } from './use-action-bar'

interface ActionBarProps {
	automationName?: string
}

export function ActionBar({ automationName }: ActionBarProps) {
	const { onDelete, onRun, selectedAutomation, modal, onLayout, newAutomation } = useActionBar()
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}
	const { onUpdate } = useUpdateAutomation()

	return (
		<>
			<div className="fixed right-10 top-[35%] -translate-y-[35%] z-10 flex flex-col gap-4 items-center">
				<div
					className="p-2 text-2xl text-white transition rounded shadow-sm bg-emerald-600 cursor-grab hover:shadow-md"
					onDragStart={(event) => onDragStart(event, NodeType.Task)}
					draggable
				>
					<BsUiChecksGrid />
				</div>
				<div
					className="p-2 text-2xl text-white transition bg-orange-600 rounded shadow-sm cursor-grab hover:shadow-md"
					onDragStart={(event) => onDragStart(event, NodeType.Trigger)}
					draggable
				>
					<BsFillCalendar3WeekFill />
				</div>
				<div className="flex flex-col gap-2 px-1 py-2 rounded shadow-sm bg-gray-50">
					<IconButton tooltip="Run" onClick={onRun} disabled={!selectedAutomation}>
						<IoPlayOutline />
					</IconButton>
					<IconButton
						tooltip="Save"
						onClick={() => {
							if (!automationName) modal.open(Modals.SaveAutomation)
							else onUpdate({ name: automationName })
						}}
					>
						<IoSaveOutline />
					</IconButton>
					<IconButton tooltip="Sort" onClick={() => onLayout('TB')}>
						<IoSwapVertical />
					</IconButton>
					<IconButton tooltip="New" onClick={newAutomation}>
						<IoAdd />
					</IconButton>
					<IconButton
						tooltip="Clone"
						onClick={() => modal.open(Modals.SaveAutomation)}
						disabled={!automationName}
					>
						<IoCopyOutline />
					</IconButton>
					<IconButton tooltip="History" disabled={!automationName}>
						{automationName && (
							<Link to={`/automations/${automationName}/executions`}>
								<IoCalendarOutline />
							</Link>
						)}
						{!automationName && <IoCalendarOutline />}
					</IconButton>
					<IconButton tooltip="Delete" disabled={!selectedAutomation} onClick={onDelete}>
						<IoTrashOutline />
					</IconButton>
				</div>
			</div>
			<Modal title="New Automation" kind={Modals.SaveAutomation}>
				<SaveForm />
			</Modal>
		</>
	)
}
