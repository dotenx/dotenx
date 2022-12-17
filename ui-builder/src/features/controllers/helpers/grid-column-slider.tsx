import { Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { memo, useCallback } from 'react'
import { BoxElement } from '../../elements/extensions/box'
import { viewportAtom } from '../../viewport/viewport-store'

type GridColumnSliderProps = {
	containerDiv: BoxElement
	set: (element: BoxElement) => void

	columnLimit?: {
		desktop?: {
			min: number
			max: number
		}
		tablet?: {
			min: number
			max: number
		}
		mobile?: {
			min: number
			max: number
		}
	}

	gapLimits?: {
		desktop?: {
			min: number
			max: number
		}
		tablet?: {
			min: number
			max: number
		}
		mobile?: {
			min: number
			max: number
		}
	}
}

function GridColumnSlider({
	set,
	containerDiv,
	gapLimits,
	columnLimit,
}: GridColumnSliderProps): JSX.Element {
	const viewport = useAtomValue(viewportAtom)
	const countGridTemplateColumns = useCallback(
		(mode: 'desktop' | 'tablet' | 'mobile') => {
			return (
				(containerDiv.style[mode]?.default?.gridTemplateColumns?.toString() || '').split(
					'1fr'
				).length - 1
			)
		},
		[containerDiv.style]
	)

	return (
		<>
			{viewport === 'desktop' && (
				<>
					<p>Desktop mode columns</p>
					<Slider
						step={1}
						min={columnLimit?.desktop?.min ?? 1}
						max={columnLimit?.desktop?.max ?? 10}
						styles={{ markLabel: { display: 'none' } }}
						value={countGridTemplateColumns('desktop')}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.desktop = {
										default: {
											...draft.style.desktop?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						min={gapLimits?.desktop?.min || 0}
						max={gapLimits?.desktop?.max || 100}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.desktop = {
										default: {
											...draft.style.desktop?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}
			{viewport === 'tablet' && (
				<>
					<p>Tablet mode columns</p>
					<Slider
						step={1}
						min={columnLimit?.tablet?.min || 1}
						max={columnLimit?.tablet?.max || 10}
						styles={{ markLabel: { display: 'none' } }}
						value={countGridTemplateColumns('tablet')}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.tablet = {
										default: {
											...draft.style.tablet?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						min={gapLimits?.tablet?.min || 0}
						max={gapLimits?.tablet?.max || 20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.tablet = {
										default: {
											...draft.style.tablet?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}
			{viewport === 'mobile' && (
				<>
					<p>Mobile mode columns</p>
					<Slider
						step={1}
						min={columnLimit?.mobile?.min || 1}
						max={columnLimit?.mobile?.max || 10}
						styles={{ markLabel: { display: 'none' } }}
						value={countGridTemplateColumns('mobile')}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.mobile = {
										default: {
											...draft.style.mobile?.default,
											// prettier-ignore
											...{ gridTemplateColumns: '1fr '.repeat(val).trimEnd() },
										},
									}
								})
							)
						}}
					/>
					<p>Gap</p>
					<Slider
						label={(val) => val + 'px'}
						min={gapLimits?.mobile?.min || 0}
						max={gapLimits?.mobile?.max || 20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={1}
						onChange={(val) => {
							set(
								produce(containerDiv, (draft) => {
									draft.style.mobile = {
										default: {
											...draft.style.mobile?.default,
											// prettier-ignore
											...{ gap: `${val}px`},
										},
									}
								})
							)
						}}
					/>
				</>
			)}
		</>
	)
}
export default memo(GridColumnSlider)
