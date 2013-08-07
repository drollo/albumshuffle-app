require([
  '$api/models',
  'scripts/albumshuffle',
  '$views/list',
  '$views/buttons'
], function(models, albumShuffle, list, buttons) {
  'use strict';

  var sourcePlaylistURI = "", destinationPlaylistURI = "";
  var sourceUriOK = false, destinationUriOK = false;

  var sourceInputElement = document.getElementById('SOURCE_URI_ID');
  sourceInputElement.addEventListener('input', readSource);

  var destinationInputElement = document.getElementById('DESTINATION_URI_ID');
  destinationInputElement.addEventListener('input', readDestination);

  initButtons();

  function initButtons() {
    var button = buttons.Button.withLabel('Shuffle albums');
    var buttonElement = document.getElementById('buttonContainer');
    buttonElement.addEventListener('click', shuffleHandler);
    buttonElement.appendChild(button.node);

    var clearSourceButtonElement = document.getElementById("clearSourceButton");
    clearSourceButtonElement.addEventListener('click', clearSourceHandler);

    var clearDestinationButtonElement = document.getElementById("clearDestinationButton");
    clearDestinationButtonElement.addEventListener('click', clearDestinationHandler);
  }

  function readSource() {
    sourcePlaylistURI = sourceInputElement.value;
    if (sourcePlaylistURI != "") {
      models.Playlist.fromURI(sourcePlaylistURI).load('name').done(function(sourcePlaylist) {
        sourceInputElement.value = sourcePlaylist.name;
        sourceInputElement.disabled = true;
      }).fail(function() {
        sourceInputElement.value = "";
      });
    }
  }

  function readDestination() {
    destinationPlaylistURI = destinationInputElement.value;
    if (destinationPlaylistURI != "") {
      models.Playlist.fromURI(destinationPlaylistURI).load('name').done(function(destinationPlaylist) {
        destinationInputElement.value = destinationPlaylist.name;
        destinationInputElement.disabled = true;
      }).fail(function() {
        destinationInputElement.value = "";
      });
    }
  }

  function clearSourceHandler() {
    sourceInputElement.value = "";
    sourceInputElement.disabled = false;
    sourcePlaylistURI = "";
  }

  function clearDestinationHandler() {
    destinationInputElement.value = "";
    destinationInputElement.disabled = false;
    destinationPlaylistURI = "";
  }

  function shuffleHandler() {
    if (sourcePlaylistURI != "" && destinationPlaylistURI != "") {
      albumShuffle.shuffleAlbums(sourcePlaylistURI, destinationPlaylistURI);

      var destinationPlaylist = models.Playlist.fromURI(destinationPlaylistURI);   
      var playlistTable = list.List.forPlaylist(destinationPlaylist, { 
        fields: [
          'nowplaying',
          'track', 
          'artist', 
          'album', 
          'time'
        ],
        style: "rounded"
      });
        
      var playlistElement = document.getElementById('playlistContainer');
      if (playlistElement.childNodes.length != 0)
      {
        playlistElement.removeChild(playlistElement.childNodes[0]);
      }
      playlistElement.appendChild(playlistTable.node);
      playlistTable.init();
    }
  } 
});