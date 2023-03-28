/* eslint-disable no-undef */

; (async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const splidePlaceHolder = root.querySelector('.splide-place-holder');
	const preview = splidePlaceHolder.querySelector('.preview');
	preview.remove();
	const template = root.querySelector('.template');
	const clone = template.content.cloneNode(true);
	splidePlaceHolder.appendChild(clone);

	var splide = new Splide(`#{{id}} .splide`, {
		arrows: false,
		pagination: false,
	});

	splide.mount();

	const photos = splidePlaceHolder.querySelectorAll('.photo');
	const images= [...photos].map(p => eval(p.getAttribute('x-bind:src')))

	const photo = root.querySelector('.photo');

	root.querySelector('.prev').addEventListener('click', function () {
		if (splide.index === splide.length - 1) {
			splide.go(0);
			photo.src = images[0];
			console.log(splide.index, " going to 0")
		} else {
			splide.go('>');
			photo.src = images[splide.index];
			console.log(splide.index, " going to prev")
		}
	});
	root.querySelector('.next').addEventListener('click', function () {
		if (splide.index === 0) {
			splide.go(splide.length - 1);
			photo.src = images[splide.length - 1];
			console.log(splide.index, " going to last")
		} else {
			splide.go('<');
			photo.src = images[splide.index];
			console.log(splide.index, " going to next")
		}
	});

})()
