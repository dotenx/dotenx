import { TextInput, Checkbox } from '@mantine/core'
import produce from 'immer'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import imageUrl from '../../assets/components/feature-details-right.png'

import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import { Divider, SimpleComponentOptionsProps } from './helpers'
import { ImageDrop } from '../ui/image-drop'
import { Tabs, Panel, DragTabList, PanelList, Tab, ExtraButton } from '@react-tabtab-next/tabtab'
import { ImageElement } from '../elements/extensions/image'

export class FeatureDetailsRight extends Controller {
	name = 'Feature with details on the right'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FeatureDetailsRightOptions options={options} />
	}
}

// =============  renderOptions =============

function FeatureDetailsRightOptions({ options }: SimpleComponentOptionsProps) {
	const imageDiv = options.element.children?.[0] as ImageElement

	const featureRowsWrapper = options.element.children?.[1].children?.[0] as BoxElement
	const featureRows = featureRowsWrapper.children as BoxElement[]

	const [activeTab, setActiveTab] = useState(0)
	const [tabs, setTabs] = useState<{ title: string; content: ReactNode }[]>([])

	useEffect(() => {
		const tabsList = featureRows.map((featureRow, index) => {
			const title = featureRow.children?.[0] as TextElement
			const details = featureRow.children?.[1] as TextElement
			return {
				title: index + 1 + '',
				content: (
					<div key={index}>
						<TextInput
							label="Title"
							name="title"
							size="xs"
							value={title.data.text}
							onChange={(event) =>
								options.set(
									produce(title, (draft) => {
										draft.data.text = event.target.value
									})
								)
							}
						/>
						<TextInput
							label="Details"
							name="details"
							size="xs"
							value={details.data.text}
							onChange={(event) =>
								options.set(
									produce(details, (draft) => {
										draft.data.text = event.target.value
									})
								)
							}
						/>
					</div>
				),
			}
		})
		setTabs(tabsList)
	}, [featureRows, options])

	const tabItems = useMemo(() => {
		return tabs.map((tab, index) => {
			return (
				<Tab closable key={index}>
					{tab.title}
				</Tab>
			)
		})
	}, [tabs])

	const panelItems = useMemo(() => {
		return tabs.map((tab, index) => {
			return <Panel key={index}>{tab.content}</Panel>
		})
	}, [tabs])

	const handleOnTabSequenceChange = useCallback(
		({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
			console.log({ oldIndex, newIndex })

			options.set(
				produce(featureRowsWrapper, (draft) => {
					const temp = draft.children![oldIndex]
					draft.children![oldIndex] = draft.children![newIndex]
					draft.children![newIndex] = temp
				})
			)
			setActiveTab(newIndex)
		},
		[featureRowsWrapper, options]
	)

	const handleOnTabChange = useCallback((i: number) => {
		setActiveTab(i)
	}, [])

	return (
		<div className="space-y-6">
			<Divider title="Image" />
			<ImageDrop
				onChange={(src) =>
					options.set(
						produce(imageDiv, (draft) => {
							draft.data.src = src
						})
					)
				}
				src={imageDiv.data.src}
			/>
			<Checkbox
				label={'Round corners'}
				onChange={(event: any) => {
					if (event.currentTarget.checked) {
						options.set(
							produce(imageDiv, (draft) => {
								draft.style.desktop!.default!.borderRadius = '10px'
							})
						)
					} else
						options.set(
							produce(imageDiv, (draft) => {
								draft.style.desktop!.default!.borderRadius = '0px'
							})
						)
				}}
			/>
			<Divider title="Rows" />

			<div style={{ maxWidth: '250px' }}>
				<Tabs
					onTabClose={(i: number) => {
						options.set(
							produce(featureRowsWrapper, (draft) => {
								draft.children.splice(i, 1)
							})
						)
					}}
					showModalButton={false}
					activeIndex={activeTab}
					onTabChange={handleOnTabChange}
					onTabSequenceChange={handleOnTabSequenceChange}
					ExtraButton={
						<ExtraButton
							onClick={(e) => {
								options.set(
									produce(featureRowsWrapper, (draft) => {
										draft.children.push(
											createRow('title', 'Lorem ipsum dolor sit amet')
										)
									})
								)
							}}
						>
							+
						</ExtraButton>
					}
				>
					<DragTabList>{tabItems}</DragTabList>
					<PanelList>{panelItems}</PanelList>
				</Tabs>
			</div>
		</div>
	)
}

// =============  defaultData =============

const wrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gap: '20px',
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			width: '100%',
			height: '600px',
			alignItems: 'center',
			justifyContent: 'flex-start',
			paddingLeft: '10%',
			paddingRight: '10%',
		},
	}
	draft.style.mobile = {
		default: {
			height: '350px',
			backgroundPosition: 'right 10% bottom 80%', // todo: check why this is not working as expected. Expected right center to work
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
			width: '100%',
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
const imageContainer = produce(new ImageElement(), (draft) => {
	draft.style.desktop = {
		default: {
			width: '100%',
			maxHeight: '400px',
			height: 'auto',
			objectFit: 'cover',
			objectPosition: 'center center',
		},
	}

	draft.data.src =
		'https://img.freepik.com/free-vector/blue-marketing-charts-design-template_52683-24522.jpg?w=740&t=st=1666791210~exp=1666791810~hmac=42932320db4bb7c5f36815c67c56445ee01765aca6caaf5306415f1811690352'
}).serialize()

const featureRowsWrapper = produce(new BoxElement(), (draft) => {
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

const featureRow = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			alignItems: 'center',
			marginTop: '15px',
			marginBottom: '15px',
			marginLeft: '0px',
			marginRight: '0px',
		},
	}
	const title = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '26px',
				fontWeight: '600',
				color: 'rgb(17, 24, 39)',
			},
		}
		draft.data.text = 'title'
	})
	const details = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				color: 'rgb(55, 65, 81)',
				fontSize: '16px',
				fontWeight: '400',
			},
		}
		draft.data.text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
	})

	draft.children = [title, details]
})

const createRow = (title: string, details: string) => {
	return produce(featureRow, (draft) => {
		;(draft.children[0]! as TextElement).data.text = title
		;(draft.children[1]! as TextElement).data.text = details
	})
}

const featureRows = [
	createRow(
		'Scalable',
		"Scalable is a tool that helps you create business solutions that scale with your business.Let's take a look at an example.Say you have a business that generates a lot of leads.You have a list of 200,000 leads and you want to send each of them a customized welcome email."
	).serialize(),
	createRow(
		'Functionality',
		'Functionality is another skill that every graphic designer needs to know.You should know how to work with different data sets, and how to work with different tools.'
	).serialize(),
	createRow(
		'Security',
		'This is not just limited to your files but also your emails, your social media profiles, and your phone.Security is a hot topic in technology and people are always looking for the newest hacks and solutions, so it’s no surprise that some of the most popular tools are also the most complex to use.'
	).serialize(),
]

const defaultData = {
	...wrapper,
	components: [
		{
			...imageContainer,
		},
		{
			...detailsWrapper,
			components: [{ ...featureRowsWrapper, components: featureRows }],
		},
	],
}
