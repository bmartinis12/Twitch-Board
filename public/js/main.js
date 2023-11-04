// Variables

let form = document.querySelector('form');
let input = document.querySelector('.search-input');
let searchResultDiv = document.querySelector('.results');
let clientId;
let clientSecret;

// Onload event

document.addEventListener('DOMContentLoaded', async function() {
  await getAuthId();
  await getAuthSecret();
  await getStreams();
  await getGames();
});

// Submit event 

form.addEventListener('submit', function(e){
  e.preventDefault();
  getChannelInfo(input.value);
});

// Get Id and Secret from backend 
async function getAuthId(){
  await fetch('/apiid')
    .then((response) => response.text())
    .then((data) => {
      clientId = data;
    })
}

async function getAuthSecret(){
  await fetch('/apisecret')
    .then((response) => response.text())
    .then((data) => {
      clientSecret = data;
    })
}

// twitch api authenitcation 

async function getTwitchAuthorization() {
    let url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    return await fetch(url, {
    method: "POST",
    })
    .then((res) => res.json())
    .then((data) => {
        return data;
    });
}

// top games function

async function getGames() {
    const endpoint = "https://api.twitch.tv/helix/games/top";
    
    // Authorize twitch api
  
    let authorizationObject = await getTwitchAuthorization();
    let { access_token, expires_in, token_type } = authorizationObject;

    token_type =
    token_type.substring(0, 1).toUpperCase() +
    token_type.substring(1, token_type.length);

    let authorization = `${token_type} ${access_token}`;

    let headers = {
    authorization,
    "Client-Id": clientId,
    };

    // fetch game data
  
    fetch(endpoint, {
        headers,
    })
    .then((res) => res.json())
    .then((data) => {

        // Check for error
        if(data.error){
            alert('Sorry an error has occured and the top 10 games could not be loaded.');
            return;
        }

        data = data.data.slice(0,10);
        let count = 1;
        data.forEach(game => {
          // Add game data to webpage
          
          let gameDiv = document.createElement('div');
          gameDiv.classList.add('game-div');
          
          let rank = document.createElement('h4');
          rank.classList.add('rank');
          rank.textContent = `#${count}:`
          count++;
          gameDiv.appendChild(rank);
          
          let name = document.createElement('h4');
          name.classList.add('gameName');
          name.textContent = `${game.name}`;
          gameDiv.appendChild(name);
          
          let img = document.createElement('img');
          let preview = game.box_art_url.replace("-{width}x{height}", "");
          img.src = `${preview}`;
          gameDiv.appendChild(img);
          
          document.querySelector('.top-games').appendChild(gameDiv);
          
          gameDiv.addEventListener('click', function(){
            window.open(`https://www.twitch.tv/directory/game/${game.name}`, '_blank');
          }); 
        })
      });
}

// streams function

async function getStreams() {
    const endpoint = "https://api.twitch.tv/helix/streams";
    
    // Authorize twitch api
  
    let authorizationObject = await getTwitchAuthorization();
    let { access_token, expires_in, token_type } = authorizationObject;

    token_type =
    token_type.substring(0, 1).toUpperCase() +
    token_type.substring(1, token_type.length);

    let authorization = `${token_type} ${access_token}`;

    let headers = {
    authorization,
    "Client-Id": clientId,
    };

    // fetch stream data
  
    fetch(endpoint, {
        headers,
    })
    .then((res) => res.json())
    .then((data) => {

        // Check for error
        if(data.error){
            alert('Sorry an error has occured and the top streams could not be loaded.');
            return;
        }

      data = data.data.slice(0,10);
      data.forEach(streamer => {
        // Add stream data to webpage
        
        let streamDiv = document.createElement('div');
        streamDiv.classList.add('stream-div');
        
        let img = document.createElement('img');
        let preview = streamer.thumbnail_url.replace("-{width}x{height}", "");
        img.src = `${preview}`;
        streamDiv.appendChild(img);
        
        let streamContainer = document.createElement('div');
        streamContainer.classList.add('stream-container');
        
        let name = document.createElement('h4');
        if(streamer.user_name.length > 14){
          streamer.user_name = streamer.user_name.slice(0,15) + " " + streamer.user_name.slice(15);
        }
        name.textContent = `${streamer.user_name.replace(/_/g, " ")}`;
        streamContainer.appendChild(name);
        
        let game = document.createElement('p');
        game.textContent = `Game: ${streamer.game_name}`;
        streamContainer.appendChild(game);
        
        let viewers = document.createElement('p');
        viewers.textContent = `View count: ${streamer.viewer_count.toLocaleString()}`;
        streamContainer.appendChild(viewers);
        
        streamDiv.appendChild(streamContainer);
        document.querySelector('.streams').appendChild(streamDiv);
        
        //When user clicks stream they are brought to the stream on twitch
        
        streamDiv.addEventListener('click', function(){
          window.open(`https://www.twitch.tv/${streamer.user_login}`, '_blank');
        });
      });
    });
}

// search function

async function getChannelInfo(searchQuery) {
  // Check if the search query is valid
    if(searchQuery == '' || !searchQuery){
      alert('Please enter a valid search query.');
      input.value = '';
      searchResultDiv.innerHTML = '';
      return;
    }
  
    const endpoint = "https://api.twitch.tv/helix/search/channels";
    
    // Authorize twitch api
  
    let authorizationObject = await getTwitchAuthorization();
    let { access_token, expires_in, token_type } = authorizationObject;

    token_type =
    token_type.substring(0, 1).toUpperCase() +
    token_type.substring(1, token_type.length);

    let authorization = `${token_type} ${access_token}`;

    let headers = {
    authorization,
    "Client-Id": clientId,
    };

    // fetch channel data
  
    fetch(endpoint + `?query=${searchQuery}`, {
        headers,
    })
    .then((res) => res.json())
    .then((data) => {
        // Check for error
        if(data.error){
            alert('Sorry an error has occured and your search could not be loaded.');
            return;
        }
        
      // Add returned data to search area
      searchResultDiv.innerHTML = '';
      data = data.data;
      data.forEach(channel => {
        let channelDiv = document.createElement('div');
        channelDiv.classList.add('channel-div');
        
        let img = document.createElement('img');
        let profilePic = channel.thumbnail_url.replace("-{width}x{height}", "");
        img.src = `${profilePic}`;
        channelDiv.appendChild(img);
        
        let name = document.createElement('h4');
        name.textContent = `${channel.display_name}`;
        channelDiv.appendChild(name);
        
        let infoDiv = document.createElement('div');
        infoDiv.classList.add('info-div');
        
        let status = document.createElement('p');
        let liveOrOffline;
        if(channel.is_live == false){
          liveOrOffline = 'Offline';
          status.style.color = '#E74C3C';
        } else {
          liveOrOffline = 'Streaming';
          status.style.color = '#58D68D';
        }
        status.textContent = `Status: ${liveOrOffline}`;
        infoDiv.appendChild(status);
        
        if(!channel.game_name){
          channel.game_name = 'n/a';
        }
        let lastGame = document.createElement('p');
        lastGame.textContent = `Last game played: ${channel.game_name}`;
        infoDiv.appendChild(lastGame);
        
        let language = document.createElement('p');
        language.textContent = `Language: ${channel.broadcaster_language}`;
        infoDiv.appendChild(language);        
        
        channelDiv.appendChild(infoDiv);
        searchResultDiv.appendChild(channelDiv);
        
        //When user clicks stream they are brought to the stream on twitch
        
        channelDiv.addEventListener('click', function(){
          window.open(`https://www.twitch.tv/${channel.broadcaster_login}`, '_blank');
        });
      })
      
    });
}