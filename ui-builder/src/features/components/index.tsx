import { ReactNode } from 'react'
import {
	TbArticle,
	TbBorderHorizontal,
	TbBrandMixpanel,
	TbClick,
	TbForms,
	TbLayoutBottombar,
	TbLayoutNavbar,
	TbList,
	TbMessageChatbot,
	TbPhoto,
	TbQuestionCircle,
	TbReportMoney,
	TbSection,
	TbSlideshow,
	TbTableAlias,
	TbUser,
	TbUsers,
} from 'react-icons/tb'
import { AboutFramedImage } from './about-framed-image'
import { AboutLeft } from './about-left'
import { AboutLeft2 } from './about-left-2'
import { AboutLeft3 } from './about-left-3'
import { AboutLeft4 } from './about-left-4'
import { AboutLeft5 } from './about-left-5'
import { AboutLongDetailsLeft } from './about-long-details-left'
import { AboutLongDetailsRight } from './about-long-details-right'
import { AboutRight } from './about-right'
import { AboutRight2 } from './about-right-2'
import { AboutRight3 } from './about-right-3'
import { AboutRight4 } from './about-right-4'
import { AboutRight5 } from './about-right-5'
import { AboutVideo1 } from './about-video-1'
import { AboutVideoStatsLeft } from './about-video-stats-left'
import { AboutVideoStatsRight } from './about-video-stats-right'
import { BasicBox } from './basic-box'
import { BasicButton } from './basic-button'
import { BasicColumns } from './basic-columns'
import { BasicImage } from './basic-image'
import { BasicSlideshow } from './basic-slideshow'
import { BasicText } from './basic-text'
import { BasicVideo } from './basic-video'
import { BasicYouTube } from './basic-youtube'
import { ComparisonTable1 } from './comparison-table-1'
import { Component } from './component'
import { CustomersGrid } from './customers-grid'
import { CustomersLogoGrid } from './customers-logo-grid'
import { CustomersStatLogo } from './customers-stat-logo'
import { CustomersUserProfiles } from './customers-users'
import { DividerSimpleLine } from './divider-simple-line'
import { DividerSimpleTitle } from './divider-simple-title'
import { DividerStats } from './divider-stats'
import { DividerStatsWithLogos } from './divider-stats-logos'
import { DividerTextSections } from './divider-text-sections'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FaqCollapsible } from './faq-collapsible'
import { FeatureCardsImage } from './feature-cards-image'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureCtaImageTag } from './feature-cta-image-tag'
import { FeatureDetailsGridImageTagLeft } from './feature-details-grid-image-tag-left'
import { FeatureDetailsGridImageTagLeft2 } from './feature-details-grid-image-tag-left-2'
import { FeatureDetailsGridImageTagRight } from './feature-details-grid-image-tag-right'
import { FeatureDetailsGridImageTagRight2 } from './feature-details-grid-image-tag-right-2'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FeatureGridImageTag } from './feature-grid-image-tag'
import { FeatureGridImages } from './feature-grid-images'
import { Feature1 } from './features/feature-1'
import { Feature10 } from './features/feature-10'
import { Feature11 } from './features/feature-11'
import { Feature12 } from './features/feature-12'
import { Feature13 } from './features/feature-13'
import { Feature14 } from './features/feature-14'
import { Feature15 } from './features/feature-15'
import { Feature16 } from './features/feature-16'
import { Feature17 } from './features/feature-17'
import { Feature18 } from './features/feature-18'
import { Feature19 } from './features/feature-19'
import { Feature2 } from './features/feature-2'
import { Feature20 } from './features/feature-20'
import { Feature21 } from './features/feature-21'
import { Feature22 } from './features/feature-22'
import { Feature23 } from './features/feature-23'
import { Feature3 } from './features/feature-3'
import { Feature4 } from './features/feature-4'
import { Feature5 } from './features/feature-5'
import { Feature6 } from './features/feature-6'
import { Feature7 } from './features/feature-7'
import { Feature8 } from './features/feature-8'
import { Feature9 } from './features/feature-9'
import { FooterGrid } from './footer-grid'
import { FooterSimple } from './footer-simple'
import { FooterSimpleCentered } from './footer-simple-center'
import { FooterSimpleWithLinksOnRight } from './footer-simple-links-on-right'
import { FooterSimpleWithLinksOnRight2 } from './footer-simple-links-on-right-2'
import { FooterSimpleWithInput } from './footer-simple-with-input-1'
import { FooterSimpleWithoutIcon } from './footer-simple-without-icon'
import { Form } from './form'
import { Form2 } from './form-2'
import { FormEmailInput1 } from './form-email-input-1'
import { FormEmailInput2 } from './form-email-input-2'
import { GalleryBasic } from './gallery-basic'
import { GalleryBasicRounded } from './gallery-basic-rounded'
import { GalleryMasonryOne } from './gallery-masonry-1'
import { GalleryMasonryTwo } from './gallery-masonry-2'
import { GalleryMasonryCustomLayout } from './gallery-masonry-custom-layout'
import { GalleryWithCaptions } from './gallery-with-caption'
import { HeroCtaLeft } from './hero-cta-left'
import { HeroCtaRight } from './hero-cta-right'
import { HeroFullWidth } from './hero-full-width'
import { HeroWithBgOneCta } from './hero-with-bg-one-cta'
import { HeroWithBgTwoCta } from './hero-with-bg-two-cta'
import { HeroWithImageTwoCta } from './hero-with-image-two-cta'
import { HeroWithRating } from './hero-with-rating'
import { HeroWithRatingTwoCTAs } from './hero-with-rating-two-cta'
import { HeroWithRatingTwoCTAs2 } from './hero-with-rating-two-cta-2'
import { Navbar } from './navbar'
import { NavbarWithDropDownCta } from './navbar-with-dropdown-cta'
import { PricingSimple } from './pricing-simple'
import { PricingSimple2 } from './pricing-simple-2'
import { Slider1 } from './slider-1'
import { Slider2 } from './slider-2'
import { StepGridCtaLeft } from './step-grid-cta-left'
import { TeamCenterGrid } from './team-center-grid'
import { TeamIndividualMember } from './team-individual-member'
import { TeamIndividualMember2 } from './team-individual-member-2'
import { TeamRoundCenter } from './team-round-center'
import { TeamRoundLeft } from './team-round-left'
import { TeamSquareGrid } from './team-square-grid'
import { TestimonialSimple } from './testimonial-simple'
import { TestimonialSlider } from './testimonial-slider'
import { TestimonialSlider2 } from './testimonial-slider-2'

export const COMPONENTS: Components = [
	{
		title: 'Basic',
		icon: <TbClick />,
		items: [
			BasicImage,
			BasicText,
			BasicButton,
			BasicVideo,
			BasicYouTube,
			BasicColumns,
			BasicBox,
		],
	},
	{
		title: 'Navbar',
		icon: <TbLayoutNavbar />,
		items: [Navbar, NavbarWithDropDownCta],
	},
	{
		title: 'Hero',
		icon: <TbSection />,
		items: [
			HeroFullWidth,
			HeroCtaLeft,
			HeroCtaRight,
			HeroWithRating,
			HeroWithRatingTwoCTAs,
			HeroWithRatingTwoCTAs2,
			HeroWithBgOneCta,
			HeroWithBgTwoCta,
			HeroWithImageTwoCta,
		],
	},
	{
		title: 'About us',
		icon: <TbArticle />,
		items: [
			AboutLeft,
			AboutRight,
			AboutLeft2,
			AboutRight2,
			AboutLongDetailsLeft,
			AboutLongDetailsRight,
			AboutLeft3,
			AboutRight3,
			AboutFramedImage,
			AboutLeft4,
			AboutRight4,
			AboutLeft5,
			AboutRight5,
			AboutVideoStatsLeft,
			AboutVideoStatsRight,
			AboutVideo1,
		],
	},
	{
		title: 'Customers',
		icon: <TbUser />,
		items: [CustomersLogoGrid, CustomersGrid, CustomersUserProfiles, CustomersStatLogo],
	},
	{
		title: 'Comparison Table',
		icon: <TbTableAlias />,
		items: [ComparisonTable1],
	},
	{
		title: 'FAQ',
		icon: <TbQuestionCircle />,
		items: [FaqBasic, FaqBasicStyled, FaqCollapsible],
	},
	{
		title: 'Divider',
		icon: <TbBorderHorizontal />,
		items: [
			DividerSimpleTitle,
			DividerSimpleLine,
			DividerTextSections,
			DividerStats,
			DividerStatsWithLogos,
		],
	},
	{
		title: 'Features',
		icon: <TbList />,
		items: [
			Feature1,
			Feature2,
			Feature3,
			Feature4,
			Feature5,
			Feature6,
			Feature7,
			Feature8,
			Feature9,
			Feature10,
			Feature11,
			Feature12,
			Feature13,
			Feature14,
			Feature15,
			Feature16,
			Feature17,
			Feature18,
			Feature19,
			Feature20,
			Feature21,
			Feature22,
			Feature23,
			FeatureCenterGrid,
			FeatureCenterCards,
			FeatureGridImages,
			FeatureDetailsLeft,
			FeatureDetailsRight,
			FeatureCardsImage,
			FeatureGridImageTag,
			FeatureDetailsGridImageTagLeft,
			FeatureDetailsGridImageTagRight,
			FeatureDetailsGridImageTagLeft2,
			FeatureDetailsGridImageTagRight2,
			FeatureCtaImageTag,
		],
	},
	{
		title: 'Gallery',
		icon: <TbPhoto />,
		items: [
			GalleryBasic,
			GalleryBasicRounded,
			GalleryWithCaptions,
			GalleryMasonryOne,
			GalleryMasonryTwo,
			GalleryMasonryCustomLayout,
		],
	},
	{
		title: 'Team',
		icon: <TbUsers />,
		items: [
			TeamCenterGrid,
			TeamRoundCenter,
			TeamRoundLeft,
			TeamSquareGrid,
			TeamIndividualMember,
			TeamIndividualMember2,
		],
	},
	{
		title: 'Form',
		icon: <TbForms />,
		items: [Form, Form2, FormEmailInput1, FormEmailInput2],
	},
	{
		title: 'Slideshow',
		icon: <TbSlideshow />,
		items: [BasicSlideshow, Slider1, Slider2],
	},
	{
		title: 'Steps',
		icon: <TbBrandMixpanel />,
		items: [StepGridCtaLeft],
	},
	{
		title: 'Pricing',
		icon: <TbReportMoney />,
		items: [PricingSimple, PricingSimple2],
	},
	{
		title: 'Testimonial',
		icon: <TbMessageChatbot />,
		items: [TestimonialSimple, TestimonialSlider, TestimonialSlider2],
	},
	{
		title: 'Footers',
		icon: <TbLayoutBottombar />,
		items: [
			FooterGrid,
			FooterSimple,
			FooterSimpleCentered,
			FooterSimpleWithoutIcon,
			FooterSimpleWithInput,
			// FooterSimpleWithInput2,
			FooterSimpleWithLinksOnRight,
			FooterSimpleWithLinksOnRight2,
		],
	},
]

export type ComponentSection = (typeof COMPONENTS)[number]

export type Components = { title: string; items: (typeof Component)[]; icon?: ReactNode }[]
