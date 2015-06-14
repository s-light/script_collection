// ==UserScript==
// @name        ccmixter.org player converter
// @namespace   https://github.com/s-light/
// @description convertes the file player to raw html5 player so no flash is required.
// @include     http://ccmixter.org/*
// @version     0.1
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
    console.log("play event", event);
    // this event idea does not work...
    // var myEvent = new Event('pleaseStop');
    // document.dispatchEvent(myEvent);

    // stop all other
    // based on http://stackoverflow.com/a/19792168/574981
    var audios = document.getElementsByTagName('audio');
    // console.log( audios.length + " audios found.");
    for (var i = 0; i < audios.length; ++i) {
        // console.log("audios[" + i + "]:", audios[i]);
        // if current auido is playing than paus it
        if(audios[i] != event.target){
            if ( !audios[i].paused()) {
                audios[i].pause();
                console.log("audios" + i + " paused");
            }
        }
    }
}

function addAudioPlayer(parent_element, file_name) {
    var el_audio = document.createElement("audio");
    el_audio.controls = true;
    el_audio.src = file_name;
    // does not work?!
    // el_audio.addEventListener('pleaseStop', handlePleaseStop, false);
    // el_audio.addEventListener('play', handlePlay, false)

    parent_element.appendChild(el_audio);
}


function convertPlayer(player) {

    var playercontainer = player;
    // get raw file url from next script-tag content.
    var fileURLraw = player.nextElementSibling.firstChild.data;

    // " $('_ep_XXXXX').href = 'http://ccmixter.org/content/people_name/file_name.mp3' "
    var searchString = "').href = '";
    var searchStringIndex = fileURLraw.indexOf(searchString);
    if (searchStringIndex > 1)  {
        // we think we have a url
        var startPosition = searchStringIndex + searchString.length;
        var endPosition = fileURLraw.lastIndexOf("'");
        var fileURL = fileURLraw.substring(startPosition, endPosition);
        // check the fileURL
        if (fileURL.startsWith("http://ccmixter.org/")) {
            // now add a new html5 player..
            console.log("add Player for '" + fileURL +"'");
            addAudioPlayer(playercontainer, fileURL);
        } else {
            console.error("url does not start with ccmixter.org");
        }
    } else {
        console.error("can't finde the file url.");
    }

}

function convertAllPlayers(){
    console.groupCollapsed("convertAllPlayers:");

    // plain js
    var players = document.getElementsByClassName("playerdiv");
    for (var i = 0; i < players.length; ++i) {
        convertPlayer(players[i]);
    }
    console.log("\t found " + players.length + " players");

    console.log("add play handler to document.");
    document.addEventListener('play', handlePlay, true)

    console.log("finished.");
    console.groupEnd();
}


// call main function
convertAllPlayers();