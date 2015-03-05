document.addEventListener('DOMContentLoaded', function() {


	// Global Variables: Variables requiring a global scope
	// ----------------------------------------------------------------------------
	var transitionEvent = whichTransitionEvent(),
		animationEvent  = whichAnimationEvent(),
		elHTML          = document.documentElement,
		elBody          = document.body,
		elOverlay;


	// Helper: Check when a CSS transition or animation has ended
	// ----------------------------------------------------------------------------
	function whichTransitionEvent() {

		var trans,
			element     = document.createElement('fakeelement'),
			transitions = {
				'transition'       : 'transitionend',
				'OTransition'      : 'oTransitionEnd',
				'MozTransition'    : 'transitionend',
				'WebkitTransition' : 'webkitTransitionEnd'
			}

		for (trans in transitions) {
			if (element.style[trans] !== undefined) {
				return transitions[trans];
			}
		}

	}

	function whichAnimationEvent() {

		var anim,
			element    = document.createElement('fakeelement'),
			animations = {
				'animation'       : 'animationend',
				'OAnimation'      : 'oAnimationEnd',
				'MozAnimation'    : 'animationend',
				'WebkitAnimation' : 'webkitAnimationEnd'
			}

		for (anim in animations) {
			if (element.style[anim] !== undefined) {
				return animations[anim];
			}
		}

	}


	// Helper: CSS Fade In / Out
	// ----------------------------------------------------------------------------
	function fadeIn(thisElement) {

		// make the element fully transparent
		// (don't rely on a predefined CSS style... declare this with JS to getComputedStyle)
		thisElement.style.opacity = 0;

		// make sure the initial state is applied
		window.getComputedStyle(thisElement).opacity;

		// set opacity to 1 (CSS transition will handle the fade)
		thisElement.style.opacity = 1;

	}

	function fadeOut(thisElement) {

		// set opacity to 0 (CSS transition will handle the fade)
		thisElement.style.opacity = 0;

	}


	// Helper: Create loading animation
	// ----------------------------------------------------------------------------
	function createLoader() {

		// create loader elements
		var elLoader     = document.createElement('div'),
			elLoaderWrap = document.createElement('div'),
			elLoaderSVG  = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			elLoaderUse  = document.createElementNS('http://www.w3.org/2000/svg', 'use');

		// define loader attributes
		elLoader.setAttribute('class', 'loader_overlay');
		elLoaderWrap.setAttribute('class', 'wrap_svg');
		elLoaderUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ui_loader');

		// append loader elements
		elLoaderSVG.appendChild(elLoaderUse);
		elLoaderWrap.appendChild(elLoaderSVG);
		elLoader.appendChild(elLoaderWrap);

		return elLoader;

	}


	// Helper: Create and Destroy [data-overlay] element
	// ----------------------------------------------------------------------------
	function createOverlay(childElement, strLabel) {

		// create document fragment
		var docFragment = document.createDocumentFragment();

		// lock document scrolling
		classie.add(elHTML, 'overlay_active');

		// create empty overlay <div>
		elOverlay = document.createElement('div');

		// set data-overlay attribute as passed strLabel value
		elOverlay.setAttribute('data-overlay', strLabel);

		// append passed child elements
		elOverlay.appendChild(childElement);

		// append the [data-overlay] to the document fragement
		docFragment.appendChild(elOverlay);

		// empty document fragment into <body>
		elBody.appendChild(docFragment);

		fadeIn(elOverlay);

	}

	function destroyOverlay() {

		// unlock document scrolling
		classie.remove(elHTML, 'overlay_active');

		fadeOut(elOverlay);

		// listen for CSS transitionEnd before removing the element
		elOverlay.addEventListener(transitionEvent, removeOverlay);

	}

	// move this into destoryOverlay?
	// add id to overlay element and get it within destory?
	// maybe expand this to be passed an ID, and it can destroy / remove any element?
	function removeOverlay(e) {

		// only listen for the opacity property
		if (e.propertyName == "opacity") {

			// remove elOverlay from <body>
			elBody.removeChild(elOverlay);

			// must remove event listener!
			elOverlay.removeEventListener(transitionEvent, removeOverlay);

		}

	}


	// pageLoaded: Execute once the page has loaded and the FOUT animation has ended
	// ----------------------------------------------------------------------------
	function pageLoaded() {

		var elHeader = document.getElementsByTagName('header')[0];

		elHeader.addEventListener(animationEvent, removeFOUT);

		function removeFOUT() {

			classie.add(elHTML, 'ready');
			elHeader.removeEventListener(animationEvent, removeFOUT);

		}

	}


	// secretEmail: Add mailto link to footer
	// ----------------------------------------------------------------------------
	function secretEmail() {

		var elLinkHeader = document.getElementById('email_header'),
			elLinkFooter = document.getElementById('email_footer'),
			prefix        = 'mailto',
			local        = 'hello',
			domain       = 'northandnavy',
			suffix        = 'com';

		elLinkHeader.setAttribute('href', prefix + ':' + local + '@' + domain + '.' + suffix);
		elLinkFooter.setAttribute('href', prefix + ':' + local + '@' + domain + '.' + suffix);
		elLinkFooter.innerHTML = local + '@' + domain + '.' + suffix;

	}


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	// pageLoaded();
	// viewportHeader();
	// secretEmail();


});