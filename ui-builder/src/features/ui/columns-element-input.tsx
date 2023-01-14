import { Slider, SliderProps } from '@mantine/core'
import { useDidUpdate } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useState } from 'react'
import { OptionsWrapper } from '../controllers/helpers/options-wrapper'
import { useSetWithElement } from '../elements/elements-store'
import { ColumnsElement } from '../elements/extensions/columns'
import { viewportAtom } from '../viewport/viewport-store'

export function ColumnsElementInput({ element }: { element: ColumnsElement }) {
	const set = useSetWithElement(element)
	const viewport = useAtomValue(viewportAtom)
	const columns =
		element.style[viewport]?.default?.gridTemplateColumns?.toString().split(' ').length ?? 0
	const gap = _.parseInt(element.style[viewport]?.default?.gap?.toString() ?? '0')

	const setColumns = (value: number) => {
		set((draft) => {
			_.set(
				draft,
				`style.${viewport}.default.gridTemplateColumns`,
				'1fr '.repeat(value).trimEnd()
			)
		})
	}

	const setGap = (value: number) => {
		set((draft) => {
			_.set(draft, `style.${viewport}.default.gap`, `${value}px`)
		})
	}

	return (
		<OptionsWrapper>
			<div>
				<p className="mb-1 font-medium cursor-default">
					{_.capitalize(viewport)} mode columns
				</p>
				<SliderNoMemo
					size="xs"
					step={1}
					min={1}
					max={10}
					styles={{ markLabel: { display: 'none' } }}
					value={columns}
					onChange={setColumns}
				/>
			</div>
			<div>
				<p className="mb-1 font-medium cursor-default">Gap</p>
				<SliderNoMemo
					size="xs"
					label={(val) => val + 'px'}
					max={40}
					step={1}
					styles={{ markLabel: { display: 'none' } }}
					value={gap}
					onChange={setGap}
				/>
			</div>
		</OptionsWrapper>
	)
}

function SliderNoMemo(props: SliderProps) {
	const [value, setValue] = useState(props.value)

	useDidUpdate(() => {
		if (value) props.onChange?.(value)
	}, [value])

	useDidUpdate(() => {
		setValue(props.value)
	}, [props.value])

	return <Slider {...props} value={value} onChange={setValue} />
}
