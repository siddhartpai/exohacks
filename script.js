const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzS21pO6ZUhfWjhEHfgR8mzAG8OV1xAqzQP4SXU4jNn9rgtjqG-/exec"

var getCardController = function() {
	this.templateCard = document.querySelector('#template-card');	
	this.createNewTemplateCard = function() { return this.templateCard.content.cloneNode(true); }

	this.createCard = function(data) {
		var card = createNewTemplateCard();
		var title = document.createTextNode(data.title);
		card.querySelector('.card > .title').appendChild(title);
	    card.querySelector('.card').style.backgroundColor = data.color;
	    card.querySelector('.card').link = data.link;
	    // card.querySelector('.card').addEventListener('click',function () {
	    	// addScript(data.link);
	    // });
	    return card;
	}

	this.appendCards = function(cards) {
		cards.map((data)=>{
			var card = createCard(data);
			document.body.appendChild(card);
		});
	}
	return this;
}
var onSignIn = function(googleUser) {
	     var profile = googleUser.getBasicProfile();
	     console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	     console.log('Name: ' + profile.getName());
	     console.log('Image URL: ' + profile.getImageUrl());
	     console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
         }
function init() {
	  gapi.load('auth2', function() {
		      /* Ready. Make a call to gapi.auth2.init or some other API */
              GoogleAuth = gapi.auth2.getAuthInstance();
	      var cardController = getCardController(GoogleAuth);
	    //  cardController.appendCards();
	  });
}

function addScript( src ) {
	  var s = document.createElement( 'script' );
	  s.setAttribute( 'src', src );
	  s.setAttribute('type','application/javascript');
	  document.body.appendChild( s );
}
function respond(data){
 var cardController = getCardController()
 cardController.appendCards(data)
// addScript("")
}

const postIdea = (author, idea) => 	post(`author=${author}&idea=${idea}`)

const getIdea = (callback) => get("", (res) => callback(res))

const post = (params, callback) => {
	const xhttp = new XMLHttpRequest();
	xhttp.open("POST", APP_SCRIPT_URL, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	xhttp.onreadystatechange = (e) => {
		if (e.target.readyState == 4) {
			console.log(e.target.status, JSON.parse(xhttp.responseText))
			callback(JSON.parse(xhttp.responseText))
		}
	}
}

const get = (params, callback) => {
	const xhttp = new XMLHttpRequest();
	xhttp.open("GET", APP_SCRIPT_URL, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	xhttp.onreadystatechange = (e) => {
		if (e.target.readyState == 4) {
			// console.log(e.target.status, JSON.parse(xhttp.responseText))
			callback((xhttp.responseText))
		}
	}
}