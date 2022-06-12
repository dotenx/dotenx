import { DragEvent, ReactNode } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { BsFillCalendar3WeekFill, BsUiChecksGrid } from 'react-icons/bs'
import {
	IoAdd,
	IoCalendarOutline,
	IoCheckmark,
	IoClose,
	IoCodeSlash,
	IoCopyOutline,
	IoHelpCircle,
	IoPlayOutline,
	IoSaveOutline,
	IoSwapVertical,
	IoTrashOutline,
} from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { NodeType } from '../flow'
import { Modals, useModal } from '../hooks'
import { Button, Modal } from '../ui'
import { IconButton } from '../ui/icon-button'
import { SaveForm } from './save-form'
import { useActionBar } from './use-action-bar'
import { useActivateAutomation } from './use-activate'
import { useUpdateAutomation } from './use-update'
import { AutomationYaml } from './yaml'

interface ActionBarProps {
	automationName?: string
}

export function ActionBar({ automationName }: ActionBarProps) {
	const modal = useModal()
	const { onDelete, onRun, selectedAutomation, onLayout, newAutomation, handleDeleteAutomation } =
		useActionBar()
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}
	const { onUpdate } = useUpdateAutomation()
	const handleSave = () => {
		if (!automationName) modal.open(Modals.SaveAutomation)
		else onUpdate({ name: automationName })
	}
	useHotkeys(
		'alt+s',
		(e) => {
			e.preventDefault()
			handleSave()
		},
		[handleSave]
	)
	useHotkeys(
		'alt+r',
		(e) => {
			if (!selectedAutomation) return
			e.preventDefault()
			onRun()
		},
		[selectedAutomation, onRun]
	)
	useHotkeys(
		'alt+n',
		(e) => {
			e.preventDefault()
			newAutomation()
		},
		[newAutomation]
	)
	useHotkeys(
		'alt+a',
		(e) => {
			e.preventDefault()
			onLayout('TB')
		},
		[onLayout]
	)
	useHotkeys(
		'alt+l',
		(e) => {
			if (!automationName) return
			e.preventDefault()
			modal.open(Modals.SaveAutomation)
		},
		[modal, automationName]
	)

	const { handleActivate } = useActivateAutomation(
		selectedAutomation?.is_active ?? false,
		automationName ?? ''
	)

	return (
		<>
			<div className="fixed z-10 right-11 top-8">
				<button
					className="text-3xl transition rounded-full hover:text-slate-500 text-slate-700 outline-rose-500"
					onClick={() => modal.open(Modals.HotKeys)}
				>
					<IoHelpCircle />
				</button>
			</div>
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
					<IconButton
						tooltip="Run"
						onClick={onRun}
						disabled={!selectedAutomation || !selectedAutomation.is_active}
					>
						<IoPlayOutline />
					</IconButton>
					<IconButton
						tooltip={selectedAutomation?.is_active ? 'Deactivate' : 'Activate'}
						onClick={handleActivate}
						disabled={!selectedAutomation}
					>
						{selectedAutomation?.is_active ? <IoClose /> : <IoCheckmark />}
					</IconButton>
					<IconButton tooltip="Save" onClick={handleSave}>
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
					<IconButton
						tooltip="YAML"
						disabled={!selectedAutomation}
						onClick={() => modal.open(Modals.AutomationYaml)}
					>
						<IoCodeSlash />
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
			<Modal title="Delete Automation" kind={Modals.DeleteAutomation} fluid>
				<ConfirmDelete onSubmit={handleDeleteAutomation} />
			</Modal>
			<Modal title="Help" kind={Modals.HotKeys}>
				<div className="space-y-1 text-sm">
					<div className="pb-2">
						To delete a node <Key>Left Click</Key> on it and press <Key>Backspace</Key>
					</div>
					<div className="pb-4">
						To open node menu <Key>Right Click</Key> on it
					</div>

					<HelpItem label="Save Automation" hotkey="Alt + S" />
					<HelpItem label="Run Automation" hotkey="Alt + R" />
					<HelpItem label="New Automation" hotkey="Alt + N" />
					<HelpItem label="Arrange Nodes" hotkey="Alt + A" />
					<HelpItem label="Clone Automation" hotkey="Alt + L" />
				</div>
			</Modal>
			{automationName && (
				<Modal size="xl" title="Automation YAML" kind={Modals.AutomationYaml}>
					<AutomationYaml name={automationName} />
				</Modal>
			)}
		</>
	)
}

function HelpItem({ label, hotkey }: { label: string; hotkey: string }) {
	return (
		<div className="flex items-center justify-between px-2 py-1 rounded even:bg-slate-100">
			<span>{label}</span>
			<Key>{hotkey}</Key>
		</div>
	)
}

function Key({ children }: { children: ReactNode }) {
	return (
		<span className="px-2 font-mono border-b rounded border-slate-400 bg-slate-50">
			{children}
		</span>
	)
}

function ConfirmDelete({ onSubmit }: { onSubmit: () => void }) {
	return (
		<div className="space-y-10">
			<p>Are you sure you want to delete this automation?</p>
			<Button onClick={onSubmit}>Delete</Button>
		</div>
	)
}
