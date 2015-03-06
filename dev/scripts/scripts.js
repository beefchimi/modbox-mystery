document.addEventListener('DOMContentLoaded', function() {


	// Global Variables: Variables requiring a global scope
	// ----------------------------------------------------------------------------
	var transitionEvent = whichTransitionEvent(),
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


	// Mailchimp Form Functions
	// ----------------------------------------------------------------------------
	function formMailchimp() {

		var emailfilter     = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i,
			elForm         = document.getElementById('mc-embedded-subscribe-form'),
			elInputName    = document.getElementById('mce-NAME'),
			elInputEmail   = document.getElementById('mce-EMAIL'),
			elInputSuggest = document.getElementById('mce-SUGGEST'),
			strFormAction  = elForm.getAttribute('action');

		elForm.addEventListener('submit', function(e) {

			var numName    = elInputName.value.length,
				numEmail   = elInputEmail.value.length,
				numSuggest = elInputSuggest.value.length;

			if (numName > 0 && numEmail > 0 && numSuggest > 0) {

				var request = new XMLHttpRequest();

				request.open('GET', strFormAction, true);
				request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

				request.onload = function() {

					if (request.status >= 200 && request.status < 400) {

						// Success!
						var resp = JSON.parse(request.responseText);

						request.send(resp);

					} else {

						console.log('We reached our target server, but it returned an error');

					}

				};

				request.onerror = function() {
					console.log('There was a connection error of some sort');
				};

			} else {

				console.log('submission prevented');

				// error some stuff
				e.preventDefault();

			}

		});

	}


	// passSuggestion: Pass value from textarea to input
	// ----------------------------------------------------------------------------
	function passSuggestion() {

		var elInputHidden = document.getElementById('mce-BECAUSE'),
			elTextarea    = document.getElementById('mce-TEXT'),
			elCharCount   = document.getElementById('count_remains'),
			valTextarea,
			numCharCount;

		function updateBecause() {

			valTextarea  = elTextarea.value;
			numCharCount = 255 - valTextarea.length;

			elInputHidden.value = valTextarea;
			elCharCount.innerHTML = numCharCount;

		}

		elTextarea.addEventListener('input', updateBecause);

		updateBecause();

	}






/*


	// Mailchimp AJAX Submission
	// ----------------------------------------------------------------------------
	function mailchimpAJAX() {

		var emailfilter      = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i,
			$signupArticle  = $('#mc_embed_signup'),
			$mailchimpForm  = $('#mc-embedded-subscribe-form'),
			$mailchimpInput = $('#mce-EMAIL'),
			$responseText   = $('#mce-response-text');

		if ($mailchimpForm.length > 0) {

			$('#mc-embedded-subscribe-form').submit(function(e) {

				var $this   = $(this),
					isValid = true;

				// we may have added an error class... so let's go ahead and remove it
				$('.error').removeClass('error');

				// email ID validation
				if ( emailfilter.test( $mailchimpInput.val() ) == false ) {
					$mailchimpInput.addClass('error');
					isValid = false;
				}

				// if email is valid, submit form through ajax
				if (isValid) {

					$.ajax({

						type: 'GET',
						url:  $this.attr('action'),
						data: $this.serialize(),
						dataType: 'json',
						contentType: 'application/json; charset=utf-8',
						error: function(jqXHR, textStatus, errorThrown) {
							alert('Could not connect to the registration server. Please reload the page and try again.');
						},

						success: function(data) {

							// it worked, so hide form and display thank-you message.
							$responseText.html(data.msg);
							$signupArticle.addClass('success');
							$this[0].reset();

						}

					});

				}

				return false;

			});

		}

	}


	// Check if email input has a value
	// ----------------------------------------------------------------------------
	function inputCheckValue() {

		var formEmail  = document.getElementById('mc_embed_signup'),
			inputEmail = document.getElementById('mce-EMAIL');

		inputEmail.addEventListener('change', function() { // 'input'

			console.log('input has been changed');

			if (inputEmail.value) {
				formEmail.className = 'has-value';
			} else {
				formEmail.className = '';
			}

		});

	}
*/













	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	formMailchimp();
	// passSuggestion();


});