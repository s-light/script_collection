// ==UserScript==
// @name        ccmixter.org player converter
// @namespace   https://github.com/s-light/
// @description convertes the file player to raw html5 player so no flash is required.
// @include     http://ccmixter.org/*
// @version     0.4
// @grant       none
// ==/UserScript==

// function handlePleaseStop(event) {
//     console.log("received pleaseStop event");
//     if (this.paused == false) {
//         console.log("i will pause playing..");
//         this.pause();
//     }
// }


function handlePlay(event) {
    // console.log("play event", event);

    // this event idea does not work...
    // var myEvent = new Event('pleaseStop');
    // document.dispatchEvent(myEvent);

    // stop all other
    // based on http://stackoverflow.com/a/19792168/574981
    const audios = document.getElementsByTagName('audio');
    // console.log( audios.length + " audios found.");
    for (let i = 0; i < audios.length; ++i) {
        // console.log("audios[" + i + "]:", audios[i]);
        // if current auido is playing than paus it
        if(audios[i] != event.target){
            if ( !audios[i].paused) {
                startFadeOut(audios[i]);
                // audios[i].pause();
                // console.log("audios" + i + " paused");
            }
        }
    }
}

function addAudioPlayer(parent_element, file_name) {
    const el_audio = document.createElement("audio");
    el_audio.controls = true;
    el_audio.src = file_name;

    // this does not work..
    // el_audio.addEventListener('pleaseStop', handlePleaseStop, false);
    // el_audio.addEventListener('play', handlePlay, false)

    parent_element.appendChild(el_audio);
}

function convertPlayer(player) {
    const fileURL = extractPlayerURL(player);
    // check the fileURL
    if (fileURL.startsWith("http://ccmixter.org/")) {
        // now add a new html5 player..
        console.log("add Player for '" + fileURL +"'");
        const playercontainer = player;
        addAudioPlayer(playercontainer, fileURL);
    } else {
        console.error("url does not start with ccmixter.org");
    }
}

function convertAllPlayers(){
    console.groupCollapsed("convertAllPlayers");

    // plain js
    const players = document.getElementsByClassName("playerdiv");
    for (let i = 0; i < players.length; ++i) {
        convertPlayer(players[i]);
    }
    console.log("\t found " + players.length + " players");

    console.log("add play handler to document.");
    document.addEventListener('play', handlePlay, true);

    console.log("finished.");
    console.groupEnd();
}

// ------------------------------------------

function mediaEnded(event) {
    // console.log("mediaEnded", event);
    const playallbutton = document.getElementById("playall_button");
    const isPlaying = playallbutton.getAttribute('playing');
    // console.log("isPlaying", isPlaying);
    if (isPlaying == "true") {
        playAllNext(event.target);
    }
}

function playAllSetSongInfo(player) {
    console.log("update song info");
    // console.log("update song info", player);
    const songinfo = document.getElementById("songinfo");
    if (player) {
        const info = player.src.replace("http://ccmixter.org/content/", "");
        console.log(info);
        songinfo.textContent = info;
    } else {
        songinfo.textContent = "-";
    }
}

function playAllNext(player_current) {
    const players = document.getElementsByTagName("audio");
    for (var i = 0; i < players.length; i++) {
        const player = players[i];
        // find current player
        if (player == player_current) {
            const player_next = players[i+1];
            if (player_next) {
                // start next song
                player_next.play();
                playAllSetSongInfo(player_next);
            } else {
                // no more songs on site.
                console.log("all songs on this site played.");
                const playallbutton = document.getElementById("playall_button");
                playallbutton.setAttribute('playing', false);
                playallbutton.textContent = "play all";
                playAllSetSongInfo(undefined);
            }
        }
    }
    // for (player of players) {
    //     if (player == player_current) {
    //
    //     }
    // }
}

function playAllStop() {
    const players = document.getElementsByTagName("audio");
    for (player of players) {
        if (!player.paused) {
            player.pause();
            // startFadeOut(player);
        }
    }
}

function playAllStart() {
    const players = document.getElementsByTagName("audio");
    // check if something is allready playing
    let somethingIsPlaying = false;
    for (player of players) {
        if (!player.paused) {
            somethingIsPlaying = true;
            playAllSetSongInfo(player);
        }
    }
    if (!somethingIsPlaying) {
        players[0].play();
        playAllSetSongInfo(player[0]);
    }
}

function playAllToggle(event) {
    // console.log("PING!!", event);
    const isPlaying = event.target.getAttribute('playing');
    console.log("isPlaying", isPlaying);
    if (isPlaying == "true") {
        console.info("stop playing");
        event.target.setAttribute('playing', false);
        event.target.textContent = "play all";
        playAllStop();
    } else {
        console.info("start playing");
        event.target.setAttribute('playing', true);
        event.target.textContent = "stop";
        playAllStart();
    }
}



function playAlladdDOM() {

    const css = (
        ".playAllBox {" +
        "	  float: right;" +
        "	  padding: 0.5em;" +
        "	  margin: 0.5em 2em;" +
        "	  border-width: 0.2em;" +
        "	  border-style: solid;" +
        "	  border-radius: 1em;" +
        "}" +
        "" +
        ".playAllButton {" +
        "	  cursor: pointer;" +
        "	  padding: 0.2em 0.5em;" +
        "	  margin: 0 1em 0.1em 0;" +
        "	  background-color: rgba(0, 255, 255, 0.5);" +
        "	  border-radius: 0.5em;" +
        "	  box-shadow: -2px -2px 0.2em rgba(200, 250, 255, 0.9)," +
        "	              -2px -2px 0.2em rgba(200, 250, 255, 0.9)," +
        "	              0px 0px 1em rgba(0, 0, 0, 0.4);" +
        "}" +
        ".playAllInfo {" +
        "	  margin: 0;" +
        "}" +
        ""
    );
    addCSS(css);

    const playallbox = document.createElement("div");
    playallbox.classList.add("playAllBox");

    const parent_element = document.getElementById("header_search");
    parent_element.after(playallbox);

    const button_content = document.createTextNode("play all");
    const playallbutton = document.createElement("button");
    playallbutton.appendChild(button_content);

    playallbutton.id = "playall_button";
    playallbutton.classList.add("playAllButton");
    playallbutton.type = "button";
    playallbox.appendChild(playallbutton);

    const playallinfo = document.createElement("div");
    playallinfo.id = "playall_info";
    playallinfo.classList.add("playAllInfo");
    playallinfo.appendChild(document.createTextNode("current song: "));
    const songinfo = document.createElement("span");
    songinfo.id = "songinfo";
    songinfo.appendChild(document.createTextNode("into the sun :-)"));
    playallinfo.appendChild(songinfo);
    playallbox.appendChild(playallinfo);


    playallbutton.addEventListener('click', playAllToggle, true);
    // playallbutton.onclick = function() {
    //     console.log("PING!!");
    // };
}

function playAllinit() {
    console.groupCollapsed("playAllinit");
    playAlladdDOM();

    // const players = document.getElementsByTagName("audio");
    // for (player of players) {
    //
    // }
    document.addEventListener('ended', mediaEnded, true);

    console.log("finished.");
    console.groupEnd();
}

// ------------------------------------------

function extractPlayerURL(player_div) {
    let result = undefined;
    // get raw file url from next script-tag content.
    const fileURLraw = player_div.nextElementSibling.firstChild.data;

    // " $('_ep_XXXXX').href = 'http://ccmixter.org/content/people_name/file_name.mp3' "
    const searchString = "').href = '";
    const searchStringIndex = fileURLraw.indexOf(searchString);
    if (searchStringIndex > 1)  {
        // we think we have a url
        const startPosition = searchStringIndex + searchString.length;
        const endPosition = fileURLraw.lastIndexOf("'");
        const fileURL = fileURLraw.substring(startPosition, endPosition);
        result = fileURL;
    } else {
        console.error("can't finde the file url.");
    }
    return result;
}

function fadeOut(player) {
    // console.log("this", this);
    // console.log("player", player);

    const stepSize = player.getAttribute('stepSize');

    // if fade out is finished pause player
    if (player.volume <= 0) {
      console.log("fadeOut finished.");
      player.pause();
      console.log("player '" +  player.src +"' paused");
      window.setTimeout(resetVolume, 1, player);
    } else {
        // fadeout
        if ( (player.volume - stepSize) > 0 ) {
            player.volume = player.volume - stepSize;
        } else {
            player.volume = 0;
        }
        window.setTimeout(fadeOut, player.getAttribute('fadeStepTime'), player);
    }

}

function resetVolume(player) {
  // reset volum to original
  player.volume = player.getAttribute('volumeOriginal');
  console.log("reset volume");
}

function startFadeOut(player) {
    // console.log("this", this);
    // console.log("player", player);

    // backup original volume setting
    player.setAttribute('volumeOriginal', player.volume);

    // target fadeTime
    const fadeTime = 1000; // ms
    // target stepSize for smothe fading (range 0..1)
    const stepSize = 0.01;

    // calculate fadeStepTime
    const steps = player.volume / stepSize;
    const fadeStepTime = fadeTime / steps

    player.setAttribute('fadeStepTime', fadeStepTime);
    player.setAttribute('stepSize', stepSize);


    // player.pause();
    console.log("fadeOut started.");
    window.setTimeout(fadeOut, player.getAttribute('fadeStepTime'), player);
}

// ------------------------------------------

function addCSS(css_text) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css_text));
    const head = document.head;
    head.appendChild(style);
}

// ------------------------------------------

function main() {
  // call main function
  console.log("ccmixter.org_player_converter script v0.3")
  convertAllPlayers();
  playAllinit();
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.info("DOM fully loaded and parsed.");
    main();
    console.info("all user scripting done.");
});
