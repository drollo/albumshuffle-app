require([
  '$api/models',
  'scripts/albumshuffle',
  '$views/list#List',
  '$views/buttons'
], function(models, albumShuffle, List, buttons) {
  'use strict';

  var sourcePlaylistURI = "", destinationPlaylistURI = "";

  var button = buttons.Button.withLabel('Shuffle albums');
  var buttonElement = document.getElementById('buttonContainer');
  buttonElement.appendChild(button.node);
  buttonElement.addEventListener('click', handleClick);

  var sourceInputElement = document.getElementById('SOURCE_URI_ID');
  sourceInputElement.addEventListener('input', readSource);

  var destinationInputElement = document.getElementById('DESTINATION_URI_ID');
  destinationInputElement.addEventListener('input', readDestination);

  function readSource() {
    sourcePlaylistURI = sourceInputElement.value;
    if (sourcePlaylistURI != "") {
      models.Playlist.fromURI(sourcePlaylistURI).load('name').done(function(sourcePlaylist) {
        sourceInputElement.value = sourcePlaylist.name;
      });
    }
  }

  function readDestination() {
    destinationPlaylistURI = destinationInputElement.value;
    if (destinationPlaylistURI != "") {
      models.Playlist.fromURI(destinationPlaylistURI).load('name').done(function(sourcePlaylist) {
        destinationInputElement.value = sourcePlaylist.name;
      });
    }
  }

  function handleClick() {
    if (sourcePlaylistURI != "" && destinationPlaylistURI != "") {
      albumShuffle.shuffleAlbums(sourcePlaylistURI, destinationPlaylistURI);
      models.Playlist.fromURI(destinationPlaylistURI).load('tracks').done(function(destinationPlaylist) {
        var list = List.forPlaylist(destinationPlaylist);
        var playlistElement = document.getElementById('playlistContainer');
        if (playlistElement.childNodes.length != 0)
        {
          playlistElement.removeChild(playlistElement.childNodes[0]);
        }
        playlistElement.appendChild(list.node);
        list.init();
      });
    }
  } 
});