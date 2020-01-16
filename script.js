const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzS21pO6ZUhfWjhEHfgR8mzAG8OV1xAqzQP4SXU4jNn9rgtjqG-/exec"

const THEME = "themes";
const PROJECT = "projects";
const LoaderElem = document.getElementById("loader")
const signInButton = document.getElementById('signin');
const logoutButton = document.getElementById('signout');
const signInText = document.getElementById('signin-text');
const createProjectModal = document.getElementById('create-project');
window.onclick = function(event) {
  if (event.target == createProjectModal) {
    displayModal(false)
  }
}


const getCardController = function() {

  hideAllWrappers();
  this.themesTemplateCard = document.querySelector('#template-themes-card');
  this.projectsTemplateCard = document.querySelector('#template-projects-card');

  this.createNewTemplateCard = (type) => (type === PROJECT ?
    this.projectsTemplateCard.content.cloneNode(true) :
    this.themesTemplateCard.content.cloneNode(true))

  this.createCard = function(data, type) {
    let card = createNewTemplateCard(type);
    let title = document.createTextNode(data.name);
    card.querySelector('.card-title').appendChild(title);
    card.querySelector('.card').setAttribute('data-id', data.id);
    card.querySelector('.card').setAttribute('data-type', type);
    // If Project Cards
    if (type == PROJECT) {
      let email = window.gProfile.getEmail()
      let joinBtn = card.querySelector('.btn.join')
      let unjoinBtn = card.querySelector('.btn.unjoin')
      // check if already joined the project or not
      if (data.members.indexOf(email) != -1) {
        joinBtn.classList.remove('active');
        unjoinBtn.classList.add('active');
      } else {
        unjoinBtn.classList.remove('active');
        joinBtn.classList.add('active');
      }

      joinBtn.addEventListener('click', function() {
        displayLoader(true)
        joinProject(data.id, this);
      })

      unjoinBtn.addEventListener('click', function() {
        displayLoader(true)
        unjoinProject(data.id, this);
      })
    } else {
      // If Themes Cards
      card.querySelector('.btn').addEventListener('click', function() {
        displayLoader(true)
        showProjects(data.id);
      });
    }
    return card;
  }

  this.appendCards = function(cards, type) {
    let wrapper = document.querySelector('#wrapper-' + type);
    let wrapperCards = document.querySelector('#wrapper-' + type + '-cards');

    if (type === PROJECT && cards.length === 0) {
      console.log("Here")
      wrapper.querySelector('#wrapper-noprojects').classList.add('active');
    } else {
      cards.map((data) => {
        var card = createCard(data, type);
        wrapperCards.appendChild(card);
      });
    }
    wrapper.classList.add('active')
  }

  return this;
}


function addScript(src) {
  var s = document.createElement('script');
  s.setAttribute('src', src);
  s.setAttribute('type', 'application/javascript');
  document.body.appendChild(s);
}

function hideAllWrappers() {
  Array.from(document.querySelectorAll('.wrapper.active')).map((item) => {
    item.classList.remove('active');
  })
}

const postIdea = (author, idea) => post(`author=${author}&idea=${idea}`)

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
  xhttp.open("GET", APP_SCRIPT_URL + '?' + params, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
  xhttp.onreadystatechange = (e) => {
    if (e.target.readyState == 4) {
      callback((xhttp.responseText))
    }
  }
}



function showThemes() {
  get("action=GET_THEMES", (data) => {
    var jsonData = JSON.parse(data);
    var themes = jsonData.message;
    var cardController = getCardController()
    cardController.appendCards(themes, 'themes')
    displayLoader(false)
  });
}

function showProjects(themeId) {
  window.selectedTheme = themeId;
  // Remove all previous project Cards
  Array.from(document.querySelectorAll('#wrapper-projects-cards>.card')).map(elem => {
    elem.parentNode.removeChild(elem)
  });
  get("action=GET_PROJECTS&theme_id=" + themeId, data => {
    var jsonData = JSON.parse(data);
    var projects = jsonData.message
    var cardController = getCardController()
    cardController.appendCards(projects, 'projects')
    displayLoader(false)
  })
}

function joinProject(projectId, button) {
  let buttonWrapper = button.parentElement;
  get("action=JOIN_PROJECT&id=" + projectId + "&user=" + window.gProfile.getEmail(), data => {
    let jsonData = JSON.parse(data);
    displayLoader(false);
    if (!jsonData.error) {
      buttonWrapper.querySelector('.btn.join').classList.remove('active');
      buttonWrapper.querySelector('.btn.unjoin').classList.add('active');
    } else {
      console.log("error:", jsonData.message);
    }
  });

}

function unjoinProject(projectId, button) {
  let buttonWrapper = button.parentElement;
  get("action=LEAVE_PROJECT&id=" + projectId + "&user=" + window.gProfile.getEmail(), data => {
    let jsonData = JSON.parse(data);
    displayLoader(false);
    if (!jsonData.error) {
      buttonWrapper.querySelector('.btn.unjoin').classList.remove('active');
      buttonWrapper.querySelector('.btn.join').classList.add('active');
    } else {
      console.log("error")
    }
  });
}

function createProject(e) {
  e.preventDefault();
  const {
    idea,
    description
  } = event.target;
  const owner = window.gProfile.getEmail();
  const themeId = window.selectedTheme;
  displayLoader(true)
  get('action=CREATE_PROJECT&name=' + idea.value + '&description=' + description.value + '&owner=' + owner + '&theme_id=' + themeId, data => {
    console.log(error)
    displayModal(false)
    showProjects(themeId)
  });
}

function displayModal(show) {
  createProjectModal.style.display = show ? 'block' : 'none';
}

function displayLoader(showloader) {
  LoaderElem.style.display = showloader ? 'block' : 'none'
}

function displayLogoutButton(show) {
  logoutButton.style.display = show ? 'inline-block' : 'none'
}

function displaySigninButton(show) {
  signInButton.style.display = show ? 'inline-block' : 'none'
}

function displaySigninText(show) {
  signInText.style.display = show ? 'block' : 'none'
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    window.location.href = '/'
  });
}

var onSignIn = function(googleUser) {
  displayLoader(true);
  displayLogoutButton(true);
  displaySigninButton(false);
  displaySigninText(false);
  var profile = googleUser.getBasicProfile();
  console.log('Email: ' + profile.getEmail());
  window.gProfile = profile; // This is null if the 'email' scope is not present.
  showThemes();
}

function init() {
  displayLoader(false);
  var auth2 = gapi.auth2.getAuthInstance();
  if (auth2.isSignedIn.get() === true) {
    displayLogoutButton(true);
    displaySigninButton(false);
  } else {
    displayLogoutButton(false);
    displaySigninButton(true);
  }
}

function onSignInFailed() {
  console.log("Signin Failed");
}
