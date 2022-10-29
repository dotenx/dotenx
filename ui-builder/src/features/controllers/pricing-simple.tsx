import { Button, Slider, TextInput } from '@mantine/core'
import produce from 'immer'
import React, { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/pricing-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, SimpleComponentOptionsProps } from './helpers'

import { useAtomValue } from 'jotai'
import { viewportAtom, ViewportDevice } from '../viewport/viewport-store'
import { LinkElement } from '../elements/extensions/link'
import { IconElement } from '../elements/extensions/icon'
import { Element } from '../elements/element'
import VerticalOptions from './helpers/vertical-options'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DraggableTab, DraggableTabs } from './helpers/draggable-tabs'
import { Intelinput, inteliText } from '../ui/intelinput'

export class PricingSimple extends Controller {
	name = 'Simple pricing'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <PricingSimpleOptions options={options} />
	}
}

// =============  renderOptions =============

function PricingSimpleOptions({ options }: SimpleComponentOptionsProps) {
	const viewport = useAtomValue(viewportAtom)
	const gridDiv = options.element.children?.[0] as BoxElement

	const tabsList: DraggableTab[] = useMemo(() => {
		return gridDiv.children.map((column, index) => {
			return {
				id: column.id,
				content: (
					<div className="flex flex-col justify-stretch">
						<MemTabOptions set={options.set} tileDiv={column as BoxElement} />
					</div>
				),
				onTabDelete: () => {
					options.set(
						produce(gridDiv, (draft) => {
							draft.children.splice(index, 1)
						})
					)
				},
			}
		})
	}, [gridDiv.children, options.set])

	return (
		<div className="space-y-6">
			<ComponentName name="Simple pricing" />

			<MemGridOptions set={options.set} viewport={viewport} containerDiv={gridDiv} />
			<Divider title="Price columns" />
			<DraggableTabs
				onDragEnd={(event) => {
					const { active, over } = event
					if (active.id !== over?.id) {
						const oldIndex = tabsList.findIndex((tab) => tab.id === active?.id)
						const newIndex = tabsList.findIndex((tab) => tab.id === over?.id)
						options.set(
							produce(gridDiv, (draft) => {
								const temp = draft.children![oldIndex]
								draft.children![oldIndex] = draft.children![newIndex]
								draft.children![newIndex] = temp
							})
						)
					}
				}}
				onAddNewTab={() => {
					const newTile = createTile({
						title: 'Starter',
						yearlyPrice: '$9.99',
						monthlyPrice: '$10',
						lines: ['1 user', '10GB storage'],
					})
					options.set(
						produce(gridDiv, (draft) => {
							draft.children.push(newTile)
						})
					)
				}}
				tabs={tabsList}
			/>
		</div>
	)
}

const MemGridOptions = React.memo(GridOptions)

type GridOptionsProps = {
	viewport: ViewportDevice
	set: (element: BoxElement) => void
	containerDiv: BoxElement
}

function GridOptions({ set, containerDiv, viewport }: GridOptionsProps): JSX.Element {
	const countGridTemplateColumns = (mode: 'desktop' | 'tablet' | 'mobile') => {
		return (
			(containerDiv.style[mode]?.default?.gridTemplateColumns?.toString() || '').split('1fr')
				.length - 1
		)
	}

	return (
		<>
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
						max={20}
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
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('tablet')}
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
						max={20}
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
						min={1}
						max={10}
						styles={{ markLabel: { display: 'none' } }}
						defaultValue={countGridTemplateColumns('mobile')}
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
						max={20}
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

type TabOptionsProps = {
	set: (element: Element) => void
	tileDiv: BoxElement
}

const TabOptions = ({ tileDiv, set }: TabOptionsProps) => {
	const title = tileDiv.children[0] as TextElement
	const ctaLink = tileDiv.children[3] as LinkElement
	const ctaText = ctaLink.children?.[0] as TextElement
	const featureLinesWrapper = tileDiv.children[2] as BoxElement
	return (
		<div className="flex flex-col items-stretch gap-y-2">
			<Intelinput
				label="Title"
				placeholder="Title"
				name="title"
				size="xs"
				value={title.data.text}
				onChange={(value) =>
					set(
						produce(title, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<Divider title="Features" />
			<VerticalOptions
				showDelete={true}
				set={set}
				containerDiv={featureLinesWrapper}
				items={featureLinesWrapper.children.map((child) => {
					const text = child.children?.[1] as TextElement
					return {
						id: child.id,
						content: (
							<Intelinput
								label="Title"
								name="title"
								size="xs"
								value={text.data.text}
								onChange={(value) =>
									set(
										produce(text, (draft) => {
											draft.data.text = value
										})
									)
								}
							/>
						),
					}
				})}
			/>
			<Button
				className="mt-2"
				size="xs"
				onClick={() => {
					set(
						produce(featureLinesWrapper, (draft) => {
							draft.children?.push(createLine('new feature')) // TODO: Assign a new id
						})
					)
				}}
			>
				<FontAwesomeIcon icon={['fas', 'plus']} /> Add feature
			</Button>
			<Divider title="CTA" />
			<Intelinput
				placeholder="CTA"
				label="CTA"
				name="cta"
				size="xs"
				value={ctaText.data.text}
				onChange={(value) =>
					set(
						produce(ctaText, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<TextInput
				placeholder="Link"
				label="Link"
				name="ctaLink"
				size="xs"
				value={ctaLink.data.href}
				onChange={(event) =>
					set(
						produce(ctaLink, (draft) => {
							draft.data.href = event.target.value
						})
					)
				}
			/>
		</div>
	)
}

const MemTabOptions = React.memo(TabOptions)

// #region defaultData

const wrapperDiv = produce(new BoxElement(), (draft) => {
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

const createTileTitle = () =>
	produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				textAlign: 'center',
				padding: '20px',
				fontSize: '28px',
				fontWeight: 'bold',
			},
		}
		draft.data.text = inteliText('Standard')
	})

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

const featureLinesWrapper = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			marginTop: '20px',
			marginBottom: '20px',
			fontSize: '15px',
			minHeight: '250px',
		},
	}
	draft.style.mobile = {
		default: {
			marginTop: '0px',
			marginBottom: '12px',
			fontSize: '10px',
		},
	}
})

const tileDetailsPrice = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '150px',
			gap: '4px',
		},
	}

	const priceLarge = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '48px',
				fontWeight: 'bold',
				color: 'rgba(27, 27, 27, 0.933)',
				margin: '0px',
			},
		}
		draft.data.text = inteliText('$9.99')
	})

	const termLarge = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				color: 'rgba(81, 81, 81, 0.933)',
				margin: '0px',
			},
		}
		draft.data.text = inteliText('per month')
	})

	const largePriceWrapper = produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'baseline',
				gap: '2px',
			},
		}
		draft.children = [priceLarge, termLarge]
	})

	const priceSmall = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				color: 'rgba(27, 27, 27, 0.933)',
				margin: '0px',
			},
		}
		draft.data.text = inteliText('$10')
	})

	const termSmall = produce(new TextElement(), (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '12px',
				fontWeight: 'bold',
				color: 'rgba(81, 81, 81, 0.933)',
				margin: '0px',
			},
		}
		draft.data.text = inteliText('monthly')
	})

	const smallPriceWrapper = produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'baseline',
				gap: '2px',
			},
		}
		draft.children = [priceSmall, termSmall]
	})

	draft.children = [largePriceWrapper, smallPriceWrapper]
})

const tileCta = produce(new LinkElement(), (draft) => {
	draft.style.desktop = {
		default: {
			backgroundColor: '#7670f1',
			border: 'none',
			padding: '15px',
			borderRadius: '10px',
			marginTop: '10px',
			width: '100%',
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
			fontSize: '16px',
			fontWeight: 'bold',
		},
	}

	const text = produce(new TextElement(), (draft) => {
		draft.data.text = inteliText('Learn more')
	})

	draft.data.href = '#'
	draft.data.openInNewTab = false
	draft.children = [text]
})

const newTile = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				paddingLeft: '10%',
				paddingRight: '10%',
				boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)',
				borderRadius: '10px',
				paddingBottom: '30px',
			},
		}
		draft.children = [createTileTitle(), tileDetailsPrice, featureLinesWrapper, tileCta]
	})

function createTile({
	title,
	yearlyPrice,
	monthlyPrice,
	lines,
}: {
	title: string
	yearlyPrice: string
	monthlyPrice: string
	lines: string[]
}) {
	return produce(newTile(), (draft) => {
		const featureLines = lines.map((line) => createLine(line))
		;(draft.children[0]! as BoxElement).data!.text = title
		;(draft.children[1]! as BoxElement).children![0].children![0].data!.text = yearlyPrice
		;(draft.children[1]! as BoxElement).children![1].children![0].data!.text = monthlyPrice
		;(draft.children[2]! as BoxElement).children = featureLines
	})
}

const tiles = [
	createTile({
		title: 'Starter',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10GB storage'],
	}),
	createTile({
		title: 'Basic',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10 projects', '10 GB storage'],
	}),
	createTile({
		title: 'Pro',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: ['1 user', '10 projects', '10 GB storage', 'E-mail support', 'Help center access'],
	}),
	createTile({
		title: 'Enterprise',
		yearlyPrice: '$9.99',
		monthlyPrice: '$10',
		lines: [
			'10 users',
			'Unlimited projects',
			'Unlimited storage',
			'Priority e-mail support',
			'Help center access',
			'Phone support',
			'SSL encryption',
		],
	}),
]

const grid = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr 1fr',
			gridGap: '20px',
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
	...wrapperDiv,
	components: [
		{
			...grid,
			components: tiles.map((tile) => tile.serialize()),
		},
	],
}
// #endregion
