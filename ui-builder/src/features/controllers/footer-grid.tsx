import { ActionIcon, Button, Collapse, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import imageUrl from '../../assets/components/footer-grid.png'

import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Controller, ElementOptions } from './controller'
import {
	ComponentName,
	DividerCollapsible,
	repeatObject,
	SimpleComponentOptionsProps,
} from './helpers'

import { arrayMove } from '@dnd-kit/sortable'

import { DragEndEvent } from '@dnd-kit/core'
import { TbPlus, TbX } from 'react-icons/tb'
import { Expression } from '../states/expression'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'
import { SortableItem, VerticalSortable } from './vertical-sortable'

export class FooterGrid extends Controller {
	name = 'Footer grid'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FooterGridOptions options={options} />
	}
}

// =============  renderOptions =============

function FooterGridOptions({ options }: SimpleComponentOptionsProps): JSX.Element {
	const [items, setSocialIconItems] = useState<string[]>([])

	const [addIconOpened, setAddIconOpened] = useState(false)

	const icons = {
		facebook: '#3b5998',
		twitter: '#1da1f2',
		instagram: '#e1306c',
		linkedin: '#0077b5',
		youtube: '#ff0000',
		discord: '#7289da',
		vimeo: '#1ab7ea',
		whatsapp: '#25d366',
	}
	type SocialIcon =
		| 'facebook'
		| 'twitter'
		| 'instagram'
		| 'linkedin'
		| 'youtube'
		| 'discord'
		| 'vimeo'
		| 'whatsapp'

	const [unusedIcons, setUnusedIcons] = useState<SocialIcon[]>([])

	const socialsDiv = options.element.children?.[1].children?.[1] as BoxElement

	const secondFooterTextComponent = options.element.children?.[1].children?.[0] as TextElement

	function handleDragEnd(event: any) {
		const { active, over } = event

		if (active.id !== over.id) {
			const oldIndex = items.indexOf(active.id)
			const newIndex = items.indexOf(over.id)
			setSocialIconItems((items) => {
				return arrayMove(items, oldIndex, newIndex)
			})
			options.set(
				produce(socialsDiv, (draft) => {
					draft.children = arrayMove(draft.children, oldIndex, newIndex)
				})
			)
		}
	}

	useEffect(() => {
		const itemsTemp = socialsDiv.children?.map((item) => item.id)
		setSocialIconItems(itemsTemp)
	}, [socialsDiv.children])

	return (
		<>
			<ComponentName name="Footer grid" />
			<DividerCollapsible title="Logo column">
				<LogoColumn options={options} />
			</DividerCollapsible>
			<DividerCollapsible title="Link Columns">
				<ColumnsOptions options={options} />
			</DividerCollapsible>
			{/* Secondary footer */}
			<DividerCollapsible title="Secondary footer">
				<Intelinput
					label="text"
					name="text"
					size="xs"
					value={secondFooterTextComponent.data.text}
					onChange={(value) =>
						options.set(
							produce(secondFooterTextComponent, (draft) => {
								draft.data.text = value
							})
						)
					}
				/>
				{/* Add new icon */}
				<ActionIcon
					onClick={() => setAddIconOpened((o) => !o)}
					variant="transparent"
					disabled={unusedIcons.length === 0}
				>
					<TbPlus
						size={16}
						className={
							unusedIcons.length !== 0
								? 'text-red-500 rounded-full border-red-500 border'
								: ''
						}
					/>
				</ActionIcon>
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: secondFooterTextComponent,
					title: 'Text color',
				})}
				{/* Add new icon */}
				<ActionIcon
					onClick={() => setAddIconOpened((o) => !o)}
					variant="transparent"
					disabled={unusedIcons.length === 0}
				>
					<TbPlus
						size={16}
						className={
							unusedIcons.length !== 0
								? 'text-red-500 rounded-full border-red-500 border'
								: ''
						}
					/>
				</ActionIcon>
				<Collapse in={addIconOpened}>
					<div className="flex w-full gap-x-1 my-2">
						{unusedIcons.map((u: SocialIcon) => (
							<FontAwesomeIcon
								className="w-5 h-5 cursor-pointer"
								onClick={() => {
									setUnusedIcons(unusedIcons.filter((i) => i !== u))
									setSocialIconItems([...items, u])
									options.set(
										produce(socialsDiv, (draft) => {
											draft.children.push(createSocial('fab', u, icons[u]))
										})
									)
								}}
								key={u}
								style={{
									color: icons[u],
								}}
								icon={['fab', u as IconName]}
							/>
						))}
					</div>
				</Collapse>
				{/* Order icons */}
				<VerticalSortable items={items} onDragEnd={handleDragEnd}>
					<div className="flex flex-col justify-items-stretch gap-y-2">
						{items.map((id, index) => {
							const item = socialsDiv.children?.[index] as LinkElement
							const icon = item.children?.[0] as IconElement
							return (
								<SortableItem key={id} id={id}>
									<div className="flex justify-stretch h-full w-full gap-x-1 items-center mx-2">
										<FontAwesomeIcon
											style={{
												color: icon.style.desktop!.default!.color,
											}}
											className="w-5 h-5"
											icon={[
												icon.data.type as IconPrefix,
												icon.data.name as IconName,
											]}
										/>
										<TextInput
											placeholder="Link"
											name="link"
											size="xs"
											value={item.data.href}
											onChange={(event) =>
												options.set(
													produce(item, (draft) => {
														draft.data.href = event.target.value
													})
												)
											}
										/>
										<FontAwesomeIcon
											className="w-3 h-3 text-red-500 cursor-pointer"
											icon={['fas', 'trash']}
											onClick={() => {
												setSocialIconItems((items) =>
													items.splice(index, 1)
												)
												setUnusedIcons([
													...unusedIcons,
													icon.data.name as SocialIcon,
												])
												options.set(
													produce(socialsDiv, (draft) => {
														draft.children?.splice(index, 1)
													})
												)
											}}
										/>
									</div>
								</SortableItem>
							)
						})}
					</div>
				</VerticalSortable>
			</DividerCollapsible>
		</>
	)
}

function LogoColumn({ options }: SimpleComponentOptionsProps) {
	const column = options.element.children?.[0].children?.[0] as BoxElement

	const logo = column.children?.[0].children?.[0] as ImageElement
	const title = column.children?.[0].children?.[1] as TextElement

	return (
		<div className="flex flex-col justify-stretch space-y-4">
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(logo, (draft) => {
							draft.data.src = Expression.fromString(src)
						})
					)
				}
				src={logo.data.src.toString()}
			/>
			{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}

			<Intelinput
				label="Title"
				placeholder="Text"
				name="text"
				size="xs"
				value={title.data.text}
				onChange={(value) =>
					options.set(
						produce(title, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			{ColorOptions.getTextColorOption({ options, wrapperDiv: title, title: '' })}
			<LogoColumnLines column={column as BoxElement} options={options} />
			<Button
				className="mt-2"
				size="xs"
				onClick={() => {
					options.set(
						produce(column, (draft) => {
							draft.children?.push(createLeftTextLine('New line')) // TODO: Assign a new id (it currently assigns the same link to each item causing issues)
						})
					)
				}}
			>
				<FontAwesomeIcon icon={['fas', 'plus']} /> Add line
			</Button>
			<DividerCollapsible title="color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: title,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: column,
					title: 'Column color',
				})}
			</DividerCollapsible>
		</div>
	)
}

function ColumnsOptions({ options }: SimpleComponentOptionsProps): JSX.Element {
	const rightDiv = options.element.children?.[0].children?.[1] as BoxElement

	// const tabsList =
	const tabsList: DraggableTab[] = useMemo(() => {
		return rightDiv.children.map((column, index) => {
			const columnLines = column.children
			const title = columnLines?.[0] as TextElement
			return {
				id: column.id,
				content: (
					<div className="flex flex-col justify-stretch">
						<Intelinput
							key={index}
							label="Title"
							placeholder="Text"
							name="text"
							size="xs"
							value={title.data.text}
							onChange={(value) =>
								options.set(
									produce(title, (draft) => {
										draft.data.text = value
									})
								)
							}
						/>
						{ColorOptions.getTextColorOption({
							options,
							wrapperDiv: title,
							title: 'Title color',
						})}
						<ColumnLines column={column as BoxElement} options={options} />
						<Button
							className="mt-2"
							size="xs"
							onClick={() => {
								options.set(
									produce(column, (draft) => {
										draft.children?.push(createColumnLine('New Link', '')) // TODO: Assign a new id (it currently assigns the same link to each item causing issues)
									})
								)
							}}
						>
							<FontAwesomeIcon icon={['fas', 'plus']} /> Add Link
						</Button>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(rightDiv, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [rightDiv])

	return (
		<DraggableTabs
			onDragEnd={(event) => {
				const { active, over } = event
				if (active.id !== over?.id) {
					const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
					const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
					options.set(
						produce(rightDiv, (draft) => {
							const temp = draft.children![oldIndex]
							draft.children![oldIndex] = draft.children![newIndex]
							draft.children![newIndex] = temp
						})
					)
				}
			}}
			onAddNewTab={() => {
				const columnLines = [
					createColumnLine('About us', ''),
					createColumnLine('Our services', ''),
					createColumnLine('Our products', ''),
					createColumnLine('Contact us', ''),
				]
				const b = new BoxElement()
				b.children = [createColumnTitle('Column title'), ...columnLines]

				options.set(
					produce(rightDiv, (draft) => {
						draft.children!.push(b)
					})
				)
			}}
			tabs={tabsList}
		/>
	)
}

type ColumnLinesProps = {
	options: ElementOptions
	column: BoxElement
}

function ColumnLines({ options, column }: ColumnLinesProps): JSX.Element {
	const columnLines = column.children?.slice(1) as LinkElement[]

	const [items, setItems] = useState<string[]>([])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id) {
			const oldIndex = items.indexOf(active?.id as string)
			const newIndex = items.indexOf(over?.id as string)
			setItems((items) => {
				return arrayMove(items, oldIndex, newIndex)
			})
			options.set(
				produce(column, (draft) => {
					draft.children = [
						column.children![0],
						...arrayMove(columnLines, oldIndex, newIndex),
					]
				})
			)
		}
	}

	useEffect(() => {
		const itemsTemp = columnLines.map((item) => item.id)
		setItems(itemsTemp)
	}, [columnLines, options, column])

	return (
		<VerticalSortable items={items} onDragEnd={handleDragEnd}>
			<div className="flex flex-col justify-items-stretch gap-y-2 w-full px-1">
				{items.map((id, index) => {
					if (index > columnLines.length - 1) return // TODO: This part is nonsense, but it works. Ideally the items should be updated when the columnLines are updated. useMemo should help
					const item = columnLines?.[index] as LinkElement
					const label = item.children?.[0] as TextElement
					return (
						<SortableItem key={id} id={id}>
							<div className="flex flex-col justify-center gap-y-1 h-full w-full gap-x-1 items-stretch pr-1 py-2">
								<div className="w-full relative h-4">
									<span className="absolute top-0 right-0">
										<ActionIcon
											size="xs"
											onClick={() => {
												setItems((items) => items.splice(index, 1))

												options.set(
													produce(column, (draft) => {
														draft.children?.splice(index + 1, 1)
													})
												)
											}}
										>
											<TbX />
										</ActionIcon>
									</span>
								</div>

								<Intelinput
									label="Text"
									name="text"
									size="xs"
									value={label.data.text}
									onChange={(value) =>
										options.set(
											produce(label, (draft) => {
												draft.data.text = value
											})
										)
									}
								/>
								<TextInput
									placeholder="Link"
									name="link"
									size="xs"
									value={item.data.href}
									onChange={(event) =>
										options.set(
											produce(item, (draft) => {
												draft.data.href = event.target.value
											})
										)
									}
								/>
							</div>
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: item,
								title: '',
							})}
						</SortableItem>
					)
				})}
			</div>
		</VerticalSortable>
	)
}

function LogoColumnLines({ options, column }: ColumnLinesProps): JSX.Element {
	const columnLines = column.children?.slice(1) as TextElement[]

	const [items, setItems] = useState<string[]>([])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id) {
			const oldIndex = items.indexOf(active?.id as string)
			const newIndex = items.indexOf(over?.id as string)
			setItems((items) => {
				return arrayMove(items, oldIndex, newIndex)
			})
			options.set(
				produce(column, (draft) => {
					draft.children = [
						column.children![0],
						...arrayMove(columnLines, oldIndex, newIndex),
					]
				})
			)
		}
	}

	useEffect(() => {
		const itemsTemp = columnLines.map((item) => item.id)
		setItems(itemsTemp)
	}, [columnLines, options, column])

	return (
		<VerticalSortable items={items} onDragEnd={handleDragEnd}>
			<div className="flex flex-col justify-items-stretch gap-y-2 w-full px-1">
				{items.map((id, index) => {
					if (index > columnLines.length - 1) return // TODO: This part is nonsense, but it works. Ideally the items should be updated when the columnLines are updated. useMemo should help
					const item = columnLines?.[index] as TextElement
					return (
						<SortableItem key={id} id={id}>
							<div className="flex flex-col justify-center gap-y-1 h-full w-full gap-x-1 items-stretch pr-1 py-2">
								<div className="w-full relative h-4">
									<span className="absolute top-0 right-0">
										<ActionIcon
											size="xs"
											onClick={() => {
												setItems((items) => items.splice(index, 1))

												options.set(
													produce(column, (draft) => {
														draft.children?.splice(index + 1, 1)
													})
												)
											}}
										>
											<TbX />
										</ActionIcon>
									</span>
								</div>

								<Intelinput
									label="Text"
									name="text"
									size="xs"
									value={item.data.text}
									onChange={(value) =>
										options.set(
											produce(item, (draft) => {
												draft.data.text = value
											})
										)
									}
								/>

								{ColorOptions.getTextColorOption({
									options,
									wrapperDiv: item,
									title: '',
								})}
							</div>
						</SortableItem>
					)
				})}
			</div>
		</VerticalSortable>
	)
}

// #region defaultData
const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			position: 'fixed',
			bottom: '0',
			boxSizing: 'border-box',
			flexDirection: 'column',
			paddingLeft: '10%',
			paddingRight: '10%',
			paddingTop: '20px',
			paddingBottom: '20px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'stretch',
			width: '100%',
			height: 'auto',
			backgroundColor: '#f1f1f1',
		},
	}
}).serialize()

const leftRightWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 2fr',
			paddingBottom: '20px',
		},
	}
	draft.style.mobile = {
		default: {
			gridTemplateColumns: '1fr',
		},
	}
}).serialize()

const left = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'stretch',
			gap: '10px',
			fontFamily: 'roboto',
		},
	}
}).serialize()

const logo = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			alignItems: 'center',
		},
	}
}).serialize()

const logoImage = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}

	draft.data.src = Expression.fromString(
		'https://images.unsplash.com/photo-1484256017452-47f3e80eae7c?dpr=1&auto=format&fit=crop&w=2850&q=60&cs=tinysrgb'
	)
}).serialize()

const logoText = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: 'large',
			fontWeight: 'bold',
			marginTop: '10px',
			paddingLeft: '20px',
		},
	}

	draft.data.text = inteliText('Company name')
}).serialize()

const createLeftTextLine = (text: string) =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {},
		}
		draft.data.text = inteliText(text)
	})

const leftTextLines = [
	createLeftTextLine('We do this and that').serialize(),
	createLeftTextLine('11 - 13 York Street, Sydney, NSW 2000').serialize(),
	createLeftTextLine('02 1234 5678').serialize(),
	createLeftTextLine('support@example.com').serialize(),
]

const right = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			paddingLeft: '15px',
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '20px',
			gridTemplateColumns: '1fr',
			paddingLeft: '0px',
		},
	}
}).serialize()

const column = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {},
	}
}).serialize()

const createColumnTitle = (text: string) =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: 'large',
				fontWeight: 'bold',
			},
		}
		draft.data.text = inteliText(text)
	})

const createColumnLine = (text: string, href: string) =>
	produce(new LinkElement(), (draft) => {
		draft.style.desktop = {
			default: { marginTop: '15px' },
		}

		const element = produce(new TextElement(), (draft) => {
			draft.data.text = inteliText(text)
		})

		draft.data.href = href
		draft.children = [element]
	})

const columnLines = [
	createColumnLine('About us', ''),
	createColumnLine('Our services', ''),
	createColumnLine('Our products', ''),
	createColumnLine('Contact us', ''),
].map((item) => item.serialize())

const secondaryFooter = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'space-between',
			paddingTop: '10px',
			borderTop: '1px solid #bfbfbf',
			maxHeight: '40px',
		},
	}
}).serialize()

const secondaryFooterLeft = produce(new TextElement(), (draft) => {
	draft.style.mobile = {
		default: {
			fontSize: 'small',
		},
	}
	draft.data.text = inteliText('©2030 Company name. All rights reserved.')
}).serialize()

const socials = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			gap: '10px',
		},
	}
}).serialize()

const social = produce(new LinkElement(), (draft) => {
	const element = produce(new IconElement(), (draft) => {
		draft.style.desktop = {
			default: {
				width: '20px',
				height: '20px',
				color: '#bfbfbf',
			},
		}
		draft.data.type = 'fab'
		draft.data.name = 'facebook'
	})

	draft.children = [element]
	draft.data.href = ''
})

const createSocial = (type: string, name: string, color: string) => {
	return produce(social, (draft) => {
		draft.children[0].data!.type = type
		draft.children[0].data!.name = name
		draft.children[0].style!.desktop!.default!.color = color
	})
}

const socialsList = [
	createSocial('fab', 'facebook', '#3b5998'),
	createSocial('fab', 'twitter', '#1da1f2'),
	createSocial('fab', 'instagram', '#e1306c'),
	createSocial('fab', 'linkedin', '#0077b5'),
	createSocial('fab', 'youtube', '#ff0000'),
	createSocial('fab', 'discord', '#7289da'),
	createSocial('fab', 'vimeo', '#1ab7ea'),
	createSocial('fab', 'whatsapp', '#25d366'),
].map((social) => social.serialize())

const defaultData = {
	...wrapper,
	components: [
		{
			...leftRightWrapper,
			components: [
				{
					...left,
					components: [
						{
							...logo,
							components: [logoImage, logoText],
						},
						...leftTextLines,
					],
				},
				{
					...right,
					components: repeatObject(
						{
							...column,
							components: [
								createColumnTitle('Column title').serialize(),
								...columnLines,
							],
						},
						3
					),
				},
			],
		},
		{
			...secondaryFooter,
			components: [
				{
					...secondaryFooterLeft,
				},
				{
					...socials,
					components: socialsList,
				},
			],
		},
	],
}
// #endregion
