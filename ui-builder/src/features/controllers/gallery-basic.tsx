import { Button, Select, SelectItem, Slider } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode, useState } from 'react'
import imageUrl from '../../assets/components/gallery-basic.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageDrop } from '../ui/image-drop'
import { viewportAtom } from '../viewport/viewport-store'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import { ComponentName, repeatObject, SimpleComponentOptionsProps } from './helpers'

export class GalleryBasic extends Controller {
	name = 'Basic Gallery'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <GalleryBasicOptions options={options} />
	}
}

// =============  renderOptions =============

function GalleryBasicOptions({ options }: SimpleComponentOptionsProps) {
	const [selectedTile, setSelectedTile] = useState(0)

	const containerDiv = options.element.children?.[0] as BoxElement
	const getSelectedSimpleDiv = () => containerDiv.children?.[selectedTile] as BoxElement
	const viewport = useAtomValue(viewportAtom)

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
			<ComponentName name="Basic Gallery" />
			{viewport === 'desktop' && (
				<>
					<p>Desktop mode columns</p>
					<Slider
						step={1}
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('desktop')}
						onChange={(val) => {
							options.set(
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
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							options.set(
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
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('tablet')}
						onChange={(val) => {
							options.set(
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
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						onChange={(val) => {
							options.set(
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
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('mobile')}
						onChange={(val) => {
							options.set(
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
						max={20}
						step={1}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={1}
						onChange={(val) => {
							options.set(
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
			{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}

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
			components: repeatObject(simpleDiv, 6),
		},
	],
}
