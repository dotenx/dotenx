import { Button, Select, SelectItem, Slider } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/gallery-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'

export class GalleryBasic extends Controller {
	name = 'Basic Gallery'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
	}
}

// =============  renderOptions =============

type GalleryBasicOptionsProps = {
	options: ElementOptions
}

function GalleryBasicOptions({ options }: GalleryBasicOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)

	const containerDiv = options.element.children?.[0] as BoxElement
	const getSelectedSimpleDiv = () => containerDiv.children?.[selectedTile] as BoxElement

	const MARKS = [
		{ value: 0, label: '1' },
		{ value: 25, label: '2' },
		{ value: 50, label: '3' },
		{ value: 75, label: '4' },
		{ value: 100, label: '5' },
	]

	const countGridTemplateColumns = (mode: string) => {
		switch (mode) {
			case 'desktop':
				// prettier-ignore
				return ((containerDiv.style.desktop?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
			case 'tablet':
				// prettier-ignore
				return ((containerDiv.style.tablet?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
			default:
				// prettier-ignore
				return ((containerDiv.style.mobile?.default?.gridTemplateColumns?.toString() || '').split('1fr').length - 2) * 25
		}
	}
	return (
		<div className="space-y-6">
			<p>Desktop mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('desktop')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.desktop = {
								default: {
									...draft.style.desktop?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>
			<p>Tablet mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('tablet')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.tablet = {
								default: {
									...draft.style.tablet?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>
			<p>Mobile mode columns</p>
			<Slider
				label={(val) => MARKS.find((mark) => mark.value == val)?.label}
				step={25}
				marks={MARKS}
				styles={{ markLabel: { display: 'none' } }}
				value={countGridTemplateColumns('mobile')}
				onChange={(val) => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.style.mobile = {
								default: {
									...draft.style.mobile?.default,
									// prettier-ignore
									...{ gridTemplateColumns: '1fr '.repeat((val/25) + 1).trimEnd() },
								},
							}
						})
					)
				}}
			/>

			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.push(deserializeElement(simpleDiv))
						})
					)
				}}
			>
				+ Add image
			</Button>

			<Select
				label="Tiles"
				placeholder="Select a tile"
				data={containerDiv.children?.map(
					(child, index) =>
						({
							label: `Tile ${index + 1}`,
							value: index + '',
						} as SelectItem)
				)}
				onChange={(val) => {
					setSelectedTile(parseInt(val ?? '0'))
				}}
				value={selectedTile + ''}
			/>

			<ImageDrop
				onChange={(src) => {
					options.set(
						produce(getSelectedSimpleDiv(), (draft) => {
							console.log('here ', selectedTile, src)
							draft.style.desktop = {
								default: {
									...draft.style.desktop?.default,
									...{ backgroundImage: `url(${src})` },
								},
							}
						})
					)
				}}
				src={
					// remove the url() part
					getSelectedSimpleDiv()?.style.desktop?.default?.backgroundImage?.trim()
						.length === 5 // This means that the url is empty
						? ''
						: getSelectedSimpleDiv()?.style.desktop?.default?.backgroundImage?.substring(
								4,
								(getSelectedSimpleDiv()?.style.desktop?.default?.backgroundImage?.trim()
									.length ?? 0) - 1 // Remove the trailing )
						  ) ?? ''
				}
			/>

			<Button
				disabled={containerDiv.children?.length === 1}
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => {
					options.set(
						produce(containerDiv, (draft) => {
							draft.children?.splice(selectedTile, 1)
						})
					)
					setSelectedTile(selectedTile > 0 ? selectedTile - 1 : 0)
				}}
			>
				+ Delete image
			</Button>
		</div>
	)
}

// =============  defaultData =============

const divFlex = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			paddingTop: '40px',
			paddingBottom: '40px',
		},
	}
}).serialize()

const simpleDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#ee0000',
			aspectRatio: '1',
			backgroundImage:
				'url(https://images.unsplash.com/photo-1484256017452-47f3e80eae7c?dpr=1&auto=format&fit=crop&w=2850&q=60&cs=tinysrgb)', //NOTE: inside url() do not use single quotes.
			backgroundSize: 'cover',
			backgroundPosition: 'center center',
		},
	}
}).serialize()

const container = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
			gridGap: '0px',
			width: '70%',
		},
	}
	draft.style.tablet = {
		default: {
			gridTemplateColumns: '1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const defaultData = {
	...divFlex,
	components: [
		{
			...container,
			components: [...repeat(simpleDiv, 6)],
		},
	],
}

function repeat<T>(source: T, times: number): T[] {
	const result = []
	for (let i = 0; i < times; i++) {
		result.push(source)
	}
	return result
}
