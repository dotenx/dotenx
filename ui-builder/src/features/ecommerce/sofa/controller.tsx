import ctaImg from '../../../assets/themes/sofa/preview/cta.png'
import featuresTextImg from '../../../assets/themes/sofa/preview/features-text.png'
import featuresImg from '../../../assets/themes/sofa/preview/features.png'
import heroImg from '../../../assets/themes/sofa/preview/hero.png'
import infoImg from '../../../assets/themes/sofa/preview/info.png'
import logosImg from '../../../assets/themes/sofa/preview/logos.png'
import navbarImg from '../../../assets/themes/sofa/preview/navbar.png'
import { Controller, ElementOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { DndTabs } from '../../controllers/helpers/dnd-tabs'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { box, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { sofa } from './theme'

class Navbar extends Controller {
	name = 'Sofa Navbar'
	image = navbarImg
	defaultData = sofa.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const links = wrapper.find<BoxElement>(sofa.tags.navbar.links)!
		const button = wrapper.find<ButtonElement>(sofa.tags.navbar.button)!

		return (
			<ControllerWrapper name="Sofa Navbar">
				<ButtonStyler label="Button" element={button} />
				<DndTabs
					containerElement={links}
					insertElement={() => txt('Link')}
					renderItemOptions={(item) => (
						<TextStyler label="Link" element={item as TextElement} />
					)}
				/>
			</ControllerWrapper>
		)
	}
}

class Hero extends Controller {
	name = 'Sofa Hero'
	image = heroImg
	defaultData = sofa.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(sofa.tags.hero.title)!
		const desc = wrapper.find<TextElement>(sofa.tags.hero.desc)!
		const button = wrapper.find<ButtonElement>(sofa.tags.hero.button)!
		const stats = wrapper.find<BoxElement>(sofa.tags.hero.stats)!
		const img = wrapper.find<ImageElement>(sofa.tags.hero.img)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
				<ButtonStyler label="Button" element={button} />
				<ImageStyler element={img} />
				<DndTabs
					containerElement={stats}
					insertElement={() => sofa.stat({ title: 'title', desc: 'description' })}
					renderItemOptions={(item) => <StatOptions item={item} />}
				/>
			</ControllerWrapper>
		)
	}
}

function StatOptions({ item }: { item: Element }) {
	const line = item.find<BoxElement>(sofa.tags.hero.stat.line)!
	const title = item.find<TextElement>(sofa.tags.hero.stat.title)!
	const desc = item.find<TextElement>(sofa.tags.hero.stat.desc)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
			<BoxStyler label="Line" element={line} />
		</OptionsWrapper>
	)
}

class Logos extends Controller {
	name = 'Sofa Logos'
	image = logosImg
	defaultData = sofa.logos()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const logos = wrapper.find<BoxElement>(sofa.tags.logos)!

		return (
			<ControllerWrapper name={this.name}>
				<DndTabs
					containerElement={logos}
					insertElement={img}
					renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
				/>
			</ControllerWrapper>
		)
	}
}

class FeaturesText extends Controller {
	name = 'Sofa Features Text'
	image = featuresTextImg
	defaultData = sofa.featuresText()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(sofa.tags.featuresText.title)!
		const desc = wrapper.find<TextElement>(sofa.tags.featuresText.desc)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
			</ControllerWrapper>
		)
	}
}

class Features extends Controller {
	name = 'Sofa Features'
	image = featuresImg
	defaultData = sofa.features()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const features = wrapper.find<BoxElement>(sofa.tags.features.grid)!

		return (
			<ControllerWrapper name={this.name}>
				<DndTabs
					containerElement={features}
					insertElement={box}
					renderItemOptions={(item) => <FeatureOptions item={item} />}
				/>
			</ControllerWrapper>
		)
	}
}

function FeatureOptions({ item }: { item: Element }) {
	const icon = item.find<IconElement>(sofa.tags.features.icon)!
	const title = item.find<TextElement>(sofa.tags.features.title)!
	const desc = item.find<TextElement>(sofa.tags.features.desc)!

	return (
		<OptionsWrapper>
			<IconStyler label="Icon" element={icon} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
		</OptionsWrapper>
	)
}

class Info extends Controller {
	name = 'Sofa Info'
	image = infoImg
	defaultData = sofa.info()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(sofa.tags.info.title)!
		const desc = wrapper.find<TextElement>(sofa.tags.info.desc)!
		const button = wrapper.find<ButtonElement>(sofa.tags.info.button)!
		const img = wrapper.find<ImageElement>(sofa.tags.info.img)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Description" element={desc} />
				<ButtonStyler label="Button" element={button} />
				<ImageStyler element={img} />
			</ControllerWrapper>
		)
	}
}

class Cta extends Controller {
	name = 'Sofa Cta'
	image = ctaImg
	defaultData = sofa.cta()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const button = wrapper.find<ButtonElement>(sofa.tags.cta.button)!

		return (
			<ControllerWrapper name={this.name}>
				<ButtonStyler label="Button" element={button} />
			</ControllerWrapper>
		)
	}
}

export const sofaControllers = [Navbar, Hero, Logos, FeaturesText, Features, Info, Cta]
