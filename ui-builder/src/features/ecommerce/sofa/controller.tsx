import { Controller } from '../../controllers/controller'
import { ComponentName } from '../../controllers/helpers'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { sofa } from './theme'

class Navbar extends Controller {
	name = 'Sofa Navbar'
	image = ''
	defaultData = sofa.navbar()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class Hero extends Controller {
	name = 'Sofa Hero'
	image = ''
	defaultData = sofa.hero()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class Logos extends Controller {
	name = 'Sofa Logos'
	image = ''
	defaultData = sofa.logos()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class FeaturesText extends Controller {
	name = 'Sofa FeaturesText'
	image = ''
	defaultData = sofa.featuresText()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class Features extends Controller {
	name = 'Sofa Features'
	image = ''
	defaultData = sofa.features()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class Info extends Controller {
	name = 'Sofa Info'
	image = ''
	defaultData = sofa.info()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

class Cta extends Controller {
	name = 'Sofa Cta'
	image = ''
	defaultData = sofa.cta()
	renderOptions = () => (
		<OptionsWrapper>
			<ComponentName name={this.name} />
		</OptionsWrapper>
	)
}

export const sofaControllers = [Navbar, Hero, Logos, FeaturesText, Features, Info, Cta]
