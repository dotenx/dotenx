/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { ButtonHTMLAttributes } from 'react'
import { BsPlay, BsPlus, BsSave2, BsSortDownAlt, BsTrash2 } from 'react-icons/bs'
import { Modals } from '../hooks'
import { Modal } from '../ui'
import { SaveForm } from './save-form'
import { useActionBar } from './use-action-bar'

const smallButton = css({ fontSize: 12, padding: '2px 0', width: 50 })

interface ActionBarProps {
	deselectPipeline: () => void
}

export const redSmallButton = [
	smallButton,
	(theme: Theme) => ({
		backgroundColor: theme.color.negative,
		borderColor: theme.color.negative,
		borderRadius: 4,
		':not([disabled]):hover': {
			color: `${theme.color.negative}`,
		},
	}),
]

export function ActionBar({ deselectPipeline }: ActionBarProps) {
	const { mutation, onDelete, onRun, selectedPipeline, modal, onLayout, resetPipeline } =
		useActionBar(deselectPipeline)

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
				<IconButton tooltip="Delete" disabled={!selectedPipeline} onClick={onDelete}>
					<BsTrash2 />
				</IconButton>
				<IconButton tooltip="New" onClick={resetPipeline}>
					<BsPlus />
				</IconButton>
				<IconButton tooltip="Sort" onClick={() => onLayout('TB')}>
					<BsSortDownAlt />
				</IconButton>
				<IconButton tooltip="Save" onClick={() => modal.open(Modals.SavePipeline)}>
					<BsSave2 />
				</IconButton>
				<IconButton tooltip="Run" onClick={onRun} disabled={!selectedPipeline}>
					<BsPlay />
				</IconButton>
			</div>
			<Modal kind={Modals.SavePipeline}>
				<SaveForm />
			</Modal>
		</>
	)
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	tooltip: string
}

function IconButton(props: IconButtonProps) {
	return (
		<div className="relative group">
			<button
				className="flex items-center justify-center p-1 text-xl transition-all rounded hover:bg-gray-50 disabled:hover:bg-white disabled:text-gray-400 disabled:cursor-not-allowed"
				{...props}
			>
				{props.children}
			</button>
			{!props.disabled && (
				<div className="absolute hidden px-2 py-1 mt-2 text-xs text-white bg-gray-900 rounded group-hover:block left-[50%] -translate-x-[50%]">
					{props.tooltip}
				</div>
			)}
		</div>
	)
}
