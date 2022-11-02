import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useMemo, useState } from 'react'
import imageUrl from '../../assets/components/about-right.png'

import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { ImageDrop } from '../ui/image-drop'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'
import { Controller, ElementOptions } from './controller'
import {
	ComponentName,
	DividerCollapsible,
	extractUrl,
	SimpleComponentOptionsProps,
} from './helpers'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'

export class AboutRight extends Controller {
	name = 'About us with details on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <AboutRightOptions options={options} />
	}
}

// =============  renderOptions =============

function AboutRightOptions({ options }: SimpleComponentOptionsProps) {
	const wrapper = options.element as BoxElement
	const title = options.element.children?.[0].children?.[0] as TextElement
	const subTitle = options.element.children?.[0].children?.[1] as TextElement
	const featureLinesWrapper = options.element.children?.[0].children?.[2] as BoxElement
	const featureLines = featureLinesWrapper.children as BoxElement[]
	const cta = options.element.children?.[0].children?.[3] as LinkElement
	const ctaText = cta.children?.[0] as TextElement

	const [activeTab, setActiveTab] = useState(0)
	const [tabs, setTabs] = useState<{ title: string; content: ReactNode }[]>([])

	const tabsList: DraggableTab[] | null[] = useMemo(() => {
		return featureLines.map((featureLine, index) => {
			const icon = featureLine.children?.[0] as IconElement
			const text = featureLine.children?.[1] as TextElement
			return {
				id: featureLine.id,
				content: (
					<div key={index}>
						<Intelinput
							label="Title"
							name="title"
							size="xs"
							value={text.data.text}
							onChange={(value) =>
								options.set(
									produce(text, (draft) => {
										draft.data.text = value
									})
								)
							}
						/>
						<DividerCollapsible title="color">
							{ColorOptions.getTextColorOption({
								options,
								wrapperDiv: icon,
								title: 'Icon color',
							})}
							{ColorOptions.getTextColorOption({
								wrapperDiv: text,
								options,
								title: 'text color',
							})}
						</DividerCollapsible>
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(featureLinesWrapper, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [featureLines])

	return (
		<div className="space-y-6">
			<ComponentName name="About us with details on the right" />
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(wrapper, (draft) => {
							draft.style.desktop!.default!.backgroundImage = `url(${src})`
						})
					)
				}
				src={extractUrl(wrapper.style.desktop!.default!.backgroundImage as string)}
			/>
			<Intelinput
				label="Title"
				name="title"
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
			<Intelinput
				label="Sub-title"
				name="subtitle"
				size="xs"
				value={subTitle.data.text}
				onChange={(value) =>
					options.set(
						produce(subTitle, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Intelinput
				label="CTA"
				name="cta"
				size="xs"
				value={ctaText.data.text}
				onChange={(value) =>
					options.set(
						produce(ctaText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<TextInput
				label="CTA Link"
				name="ctaLink"
				size="xs"
				value={cta.data.href}
				onChange={(event) =>
					options.set(
						produce(cta, (draft) => {
							draft.data.href = event.target.value
						})
					)
				}
			/>
			<DividerCollapsible title="color">
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: wrapper,
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: title,
					title: 'Title color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: subTitle,
					title: 'Subtitle color',
				})}
				{ColorOptions.getBackgroundOption({
					options,
					wrapperDiv: cta,
					title: 'Button background color',
				})}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: cta,
					title: 'Button text color',
				})}
			</DividerCollapsible>
			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(featureLinesWrapper, (draft) => {
								const temp = draft.children![oldIndex]
								draft.children![oldIndex] = draft.children![newIndex]
								draft.children![newIndex] = temp
							})
						)
					}
				}}
				onAddNewTab={() => {
					options.set(
						produce(featureLinesWrapper, (draft) => {
							draft.children.push(createLine('Lorem ipsum dolor sit amet'))
						})
					)
				}}
				tabs={tabsList}
			/>
		</div>
	)
}

// =============  defaultData =============

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'row-reverse',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
			fontFamily: 'Rubik sans-serif',
			backgroundImage:
				'url(https://img.freepik.com/free-vector/business-man-working-hard-stock-financial-trade-market-diagram-vector-illustration-flat-design_1150-39773.jpg?w=826&t=st=1666036897~exp=1666037497~hmac=71047e78a189950cf262684b1f76f34a9f41aab3a395001031304c2edd4242a5)',
			backgroundRepeat: 'no-repeat',
			backgroundAttachment: 'fixed',
			backgroundPosition: 'left',
			backgroundSize: '60% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			height: '350px',
			backgroundPosition: 'left 10% bottom 80%', // todo: check why this is not working as expected. Expected left center to work
			backgroundSize: '60% auto',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
}).serialize()

const detailsWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			marginRight: '0px',
			maxWidth: '40%',
			lineHeight: '1.6',
		},
	}
	draft.style.tablet = {
		default: {
			lineHeight: '1.3',
		},
	}

	draft.style.mobile = {
		default: {
			maxWidth: '50%',
			lineHeight: '1.2',
		},
	}
}).serialize()

const title = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '50px',
			fontWeight: 'bold',
			marginBottom: '30px',
			color: '#333333',
		},
	}

	draft.style.mobile = {
		default: {
			fontSize: '30px',
			marginBottom: '20px',
			color: '#333333',
		},
	}

	draft.data.text = inteliText('Simplify your business')
}).serialize()

const subTitle = produce(new TextElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontSize: '18px',
			marginBottom: '30px',
			color: '#696969',
		},
	}
	draft.style.mobile = {
		default: {
			fontSize: '14px',
			marginBottom: '20px',
		},
	}
	draft.data.text = inteliText(
		'Branding starts from the inside out. We help you build a strong brand from the inside out.'
	)
}).serialize()

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '10px',
		},
	}
}).serialize()

const createFeatureLine = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'center',
				marginTop: '10px',
				marginBottom: '10px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}

		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					marginRight: '10px',
					color: '#6aa512',
				},
			}
			draft.style.tablet = {
				default: {
					width: '12px',
					height: '12px',
					marginRight: '8px',
				},
			}
			draft.style.mobile = {
				default: {
					width: '8px',
					height: '8px',
					marginRight: '4px',
				},
			}
			draft.data.name = 'check'
			draft.data.type = 'fas'
		})

		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
					color: '#717171',
				},
			}
			draft.data.text = inteliText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
		})

		draft.children = [icon, text]
	})

const createLine = (text: string) => {
	return produce(createFeatureLine(), (draft) => {
		;(draft.children[1]! as TextElement).data.text = inteliText(text)
	})
}

const featureLines = [
	createLine('Your brand is your promise to your customers').serialize(),
	createLine('Having a simple UI is a great way to improve your brand').serialize(),
	createLine('Creativity is just connecting things').serialize(),
]

const cta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#7670f1',
			border: 'none',
			padding: '15px',
			borderRadius: '10px',
			marginTop: '10px',
			width: '180px',
			height: 'auto',
			color: 'white',
			fontSize: '24px',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			cursor: 'pointer',
		},
	}

	draft.style.mobile = {
		default: {
			padding: '10px',
			borderRadius: '8px',
			marginTop: '8px',
			width: '100px',
			fontSize: '16px',
			fontWeight: 'bold',
		},
	}

	const element = new TextElement()
	element.data.text = inteliText('Get Started')

	draft.data.href = '#'
	draft.data.openInNewTab = false

	draft.children = [element]
}).serialize()

const defaultData = {
	...wrapper,
	components: [
		{
			...detailsWrapper,
			components: [
				title,
				subTitle,
				{
					...featureLinesWrapper,
					components: featureLines,
				},
				cta,
			],
		},
	],
}
