const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzS21pO6ZUhfWjhEHfgR8mzAG8OV1xAqzQP4SXU4jNn9rgtjqG-/exec"

const THEME="themes";
const PROJECT = "projects";

var getCardController = function() {
	this.templateCard = document.querySelector('#template-card');
	this.createNewTemplateCard = function() { return this.templateCard.content.cloneNode(true); }
	this.createCard = function(data, type) {
        var card = createNewTemplateCard();
        var title = document.createTextNode(data.name);
        card.querySelector('.card > .title').appendChild(title);
	    card.querySelector('.card').style.backgroundColor = data.color;
		// card.querySelector('.card').setAttribute('data-link', data.link);
		card.querySelector('.card').setAttribute('data-id',data.id);
		card.querySelector('.card').setAttribute('data-type',type);
		if(type == PROJECT){
			var email = window.gProfile.getEmail()
			if (data.members.indexOf(email) != -1) {
				card.querySelector('.card>.button.join').classList.remove('active');
				card.querySelector('.card>.button.unjoin').classList.add('active');
			}else{
				card.querySelector('.card>.button.unjoin').classList.remove('active');
				card.querySelector('.card>.button.join').classList.add('active');
			}
		}
		// card.onclick = function()
		card.querySelector('.card>.button.join').addEventListener('click', function() {
			joinProject(data.id,this);
		});
		card.querySelector('.card>.button.unjoin').addEventListener('click', function() {
			unjoinProject(data.id,this);
		})
	    card.querySelector('.card').addEventListener('click',function () {
			switch(type)  {
				case THEME:
					showProjects(data.id);
					break;
			}
	    });
	    return card;
	}
	this.appendCards = function(cards, type) {
		var wrapper = document.querySelector('#wrapper-'+type);
		hideAllWrappers()
		if(type == PROJECT){
			if (cards.length == 0) {
				document.querySelector('#wrapper-noprojects').classList.add('active');
			}
		}
		cards.map((data)=>{
			var card = createCard(data, type);
			wrapper.appendChild(card);
		});
		wrapper.classList.add('active')

	}

	return this;
}


var onSignIn = function(googleUser) {
	     var profile = googleUser.getBasicProfile();
	     console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	     console.log('Name: ' + profile.getName());
	     console.log('Image URL: ' + profile.getImageUrl());
		 console.log('Email: ' + profile.getEmail());
		 window.gProfile = profile; // This is null if the 'email' scope is not present.
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

// addScript("")
}

function hideAllWrappers() {
	Array.from(document.querySelectorAll('.wrapper.active')).map((item)=>{
		item.classList.remove('active');
	})
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
	xhttp.open("GET", APP_SCRIPT_URL+'?'+params, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send();
	xhttp.onreadystatechange = (e) => {
		if (e.target.readyState == 4) {
			// console.log(e.target.status, JSON.parse(xhttp.responseText))
			callback((xhttp.responseText))
		}
	}
}



function showThemes() {
	get("action=GET_THEMES",(data)=>{
		var jsonData = JSON.parse(data);
		var themes = jsonData.message;
		var cardController = getCardController()
		cardController.appendCards(themes, 'themes')
	});
}

function showProjects(themeId) {
	console.log(themeId);
	window.selectedTheme = themeId;
	Array.from(document.querySelectorAll('#wrapper-projects>.card')).map(elem=>{
		elem.parentNode.removeChild(elem)
	});
	get("action=GET_PROJECTS&theme_id="+themeId,data=>{
		var jsonData = JSON.parse(data);
		var projects = jsonData.message
		var cardController = getCardController()
		cardController.appendCards(projects, 'projects')
		
	})
}


function joinProject(projectId,button) {
	console.log(projectId);
	card = button.parentElement;
	get("action=JOIN_PROJECT&id="+projectId+"&user="+window.gProfile.getEmail(), data=>{
		var jsonData = JSON.parse(data);
		if(!jsonData.error){
			card.querySelector('.button.join').classList.remove('active');
			card.querySelector('.button.unjoin').classList.add('active');
		}else {

		}
	});

}

function unjoinProject(projectId,button) {
	card = button.parentElement;
	get("action=LEAVE_PROJECT&id="+projectId+"&user="+window.gProfile.getEmail(), data=>{
		var jsonData = JSON.parse(data);
		if(!jsonData.error){
			card.querySelector('.button.unjoin').classList.remove('active');
			card.querySelector('.button.join').classList.add('active');
		}else {
		
		}
	});
}

function showCreateProject() {
	hideAllWrappers();
	document.querySelector('#wrapper-create-project').classList.add('active');
}

function createProject() {
	name = document.querySelector('#idea').value;
	description = document.querySelector('#description').value;
	owner = window.gProfile.getEmail();
	themeId = window.selectedTheme;
	get('action=CREATE_PROJECT&name='+name+'&description='+description+'&owner='+owner+'&theme_id='+themeId, data=>{
		hideAllWrappers();
		showThemes();
	});
}
showThemes();
