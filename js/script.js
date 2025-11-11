var gameContainer = document.getElementById("gameContainer");
var gameCountElement = document.getElementById("gameInfo").querySelector("p");
var searchInput = document.getElementById("searchInput");

var gameModal = document.getElementById("gameModal");
var gameFrame = document.getElementById("gameFrame");
var gameTitle = document.getElementById("gameTitle");
var closeModal = document.getElementById("closeModal");
var downloadBtn = document.getElementById("downloadBtn");
var fullscreenBtn = document.getElementById("fullscreenBtn");
var aboutBlankBtn = document.getElementById("aboutBlankBtn");
var blobBtn = document.getElementById("blobBtn");
var discordBtn = document.getElementById("discordBtn");

discordBtn.onclick = function(){
  window.open("https://discord.gg/FGK4VBJTyd", "_blank");
};

var gamesData = [];

// Load games from json
fetch("games.json")
  .then(function(res){
    return res.json();
  })
  .then(function(games){
    gamesData = games;
    renderGames(gamesData);
  })
  .catch(function(err){
    console.error("Error loading games:", err);
  });

function renderGames(games){
  gameContainer.innerHTML = "";
  
  for(var i = 0; i < games.length; i++){
    var game = games[i];
    
    // get current theme settings for glow effect
    var savedSettings = localStorage.getItem("elite_gamez_theme_v1");
    var currentSettings = DEFAULTS;
    if(savedSettings){
      try {
        currentSettings = JSON.parse(savedSettings);
      } catch(e){
        currentSettings = DEFAULTS;
      }
    }

    var card = document.createElement("div");
    card.className = "game-card";
    card.style.display = "flex";

    // apply the glow effect
    var glowSize = currentSettings.glowSize || 15;
    var glowColor = currentSettings.glowColor || '#ff6600';
    var glowStrength = currentSettings.glowStrength || 0.25;
    card.style.boxShadow = '0 0 ' + glowSize + 'px ' + hexToRGBA(glowColor, glowStrength);

    card.innerHTML = '<img src="' + game.image + '" alt="' + game.title + '">' +
                     '<h2>' + game.title + '</h2>' +
                     '<p>' + game.description + '</p>';
    
    // add click handler to image
    var img = card.querySelector("img");
    img.onclick = (function(gameData){
      return function(){
        openGame(gameData);
      };
    })(game);
    
    gameContainer.appendChild(card);
  }
  
  updateGameCount();
}

function openGame(game){
  gameFrame.src = "about:blank";
  gameFrame.src = game.url;
  gameTitle.textContent = game.title;
  gameModal.style.display = "flex";

  downloadBtn.onclick = function(){
    var a = document.createElement("a");
    a.href = game.url;
    a.download = game.title + ".html";
    a.click();
  };

  fullscreenBtn.onclick = function(){
    if(gameFrame.requestFullscreen){
      gameFrame.requestFullscreen();
    } else if(gameFrame.webkitRequestFullscreen){
      gameFrame.webkitRequestFullscreen();
    }
  };

  aboutBlankBtn.onclick = function(){
    var newTab = window.open("about:blank", "_blank");
    if(newTab){
      var html = '<html><head><title>' + game.title + '</title>' +
                 '<style>body,html{margin:0;padding:0;height:100%;overflow:hidden;}</style>' +
                 '</head><body>' +
                 '<iframe src="' + game.url + '" style="width:100vw;height:100vh;border:none;"></iframe>' +
                 '</body></html>';
      newTab.document.write(html);
      newTab.document.close();
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  };

  blobBtn.onclick = function(){
    fetch(game.url)
      .then(function(res){
        return res.text();
      })
      .then(function(html){
        var blob = new Blob([html], {type: "text/html"});
        var blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      })
      .catch(function(err){
        alert("Failed to open game: " + err);
      });
  };
}

closeModal.onclick = function(){
  gameModal.style.display = "none";
  gameFrame.src = "about:blank";
};

function updateGameCount(){
  var cards = gameContainer.children;
  var visibleCount = 0;
  
  for(var i = 0; i < cards.length; i++){
    if(cards[i].style.display !== "none"){
      visibleCount++;
    }
  }
  
  gameCountElement.textContent = "Games: " + visibleCount;
}

searchInput.addEventListener("input", function(){
  var filter = searchInput.value.toLowerCase();
  var cards = gameContainer.children;
  var visibleCount = 0;

  for(var i = 0; i < cards.length; i++){
    var card = cards[i];
    var titleElement = card.querySelector("h2");
    var descriptionElement = card.querySelector("p");

    if(titleElement && descriptionElement){
      var title = titleElement.textContent.toLowerCase();
      var description = descriptionElement.textContent.toLowerCase();
      
      // check if filter matches title or description
      if(title.indexOf(filter) !== -1 || description.indexOf(filter) !== -1){
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    } else {
      card.style.display = "none";
    }
  }

  gameCountElement.textContent = "Games: " + visibleCount;
});