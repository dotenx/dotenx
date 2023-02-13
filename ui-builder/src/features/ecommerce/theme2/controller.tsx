import ctaImg from '../../../assets/themes/theme2/cta.png'
import featuresImg from '../../../assets/themes/theme2/features.png'
import featureTextImg from '../../../assets/themes/theme2/featureText.png'
import heroImg from '../../../assets/themes/theme2/hero.png'
import navbarImg from '../../../assets/themes/theme2/navbar.png'
import testimonialImg from '../../../assets/themes/theme2/testimonial.png'
import { Controller, ElementOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { DndTabs } from '../../controllers/helpers/dnd-tabs'
import { icn, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { theme2 } from './theme'

class Navbar extends Controller {
	name = 'Theme 2 Navbar'
	image = navbarImg
	defaultData = theme2.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const logo = wrapper.find<ImageElement>(theme2.tags.navbar.logo)!
		const signIn = wrapper.find<ButtonElement>(theme2.tags.navbar.signIn)!
		const signUp = wrapper.find<ButtonElement>(theme2.tags.navbar.signUp)!
		const navLinks = wrapper.find<BoxElement>(theme2.tags.navbar.navLinks)!

		return (
			<ControllerWrapper name={this.name}>
				<ImageStyler element={logo} />
				<ButtonStyler element={signIn} label="Sign in" />
				<ButtonStyler element={signUp} label="Sign up" />
				<DndTabs
					containerElement={navLinks}
					insertElement={() => txt('Link')}
					renderItemOptions={(item) => (
						<TextStyler element={item as TextElement} label="Text" />
					)}
				/>
			</ControllerWrapper>
		)
	}
}

class Hero extends Controller {
	name = 'Theme 2 Hero'
	image = heroImg
	defaultData = theme2.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const image = wrapper.find<ImageElement>(theme2.tags.hero.image)!
		const title = wrapper.find<TextElement>(theme2.tags.hero.title)!
		const subtitle = wrapper.find<TextElement>(theme2.tags.hero.subtitle)!
		const button = wrapper.find<ButtonElement>(theme2.tags.hero.button)!

		return (
			<ControllerWrapper name={this.name}>
				<ImageStyler element={image} />
				<TextStyler element={title} label="Title" />
				<TextStyler element={subtitle} label="Subtitle" />
				<ButtonStyler element={button} label="Button" />
			</ControllerWrapper>
		)
	}
}

class FeatureText extends Controller {
	name = 'Theme 2 FeatureText'
	image = featureTextImg
	defaultData = theme2.featureText()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const text = wrapper.find<TextElement>(theme2.tags.featureText.text)!
		const image = wrapper.find<ImageElement>(theme2.tags.featureText.image)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={text} label="Text" />
				<ImageStyler element={image} />
			</ControllerWrapper>
		)
	}
}

class Features extends Controller {
	name = 'Theme 2 Features'
	image = featuresImg
	defaultData = theme2.features()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const features = wrapper.find<BoxElement>(theme2.tags.features.list)!

		return (
			<ControllerWrapper name={this.name}>
				<DndTabs
					containerElement={features}
					insertElement={() => theme2.feature({ title: 'Lorem ipsum', color: 'black' })}
					renderItemOptions={(item) => (
						<TextStyler
							element={item.find<TextElement>(theme2.tags.features.title)!}
							label="Title"
						/>
					)}
				/>
			</ControllerWrapper>
		)
	}
}

class Testimonial extends Controller {
	name = 'Theme 2 Testimonial'
	image = testimonialImg
	defaultData = theme2.testimonial()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme2.tags.testimonial.title)!
		const subtitle = wrapper.find<TextElement>(theme2.tags.testimonial.subtitle)!
		const image = wrapper.find<ImageElement>(theme2.tags.testimonial.image)!
		const author = wrapper.find<TextElement>(theme2.tags.testimonial.author)!
		const icons = wrapper.find<BoxElement>(theme2.tags.testimonial.icons)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={title} label="Title" />
				<TextStyler element={subtitle} label="Subtitle" />
				<ImageStyler element={image} />
				<TextStyler element={author} label="Author" />
				<DndTabs
					containerElement={icons}
					insertElement={() => icn('star').size('20px')}
					renderItemOptions={(item) => (
						<IconStyler element={item as IconElement} label="Icon" />
					)}
				/>
			</ControllerWrapper>
		)
	}
}

class Cta extends Controller {
	name = 'Theme 2 CTA'
	image = ctaImg
	defaultData = theme2.cta()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const button = wrapper.find<ButtonElement>(theme2.tags.cta.button)!

		return (
			<ControllerWrapper name={this.name}>
				<ButtonStyler element={button} label="Button" />
			</ControllerWrapper>
		)
	}
}

export const theme2Controllers = { Navbar, Hero, FeatureText, Features, Testimonial, Cta }
