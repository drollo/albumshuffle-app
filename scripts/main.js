require([
  '$api/models',
  'scripts/albumshuffle',
  '$views/list#List',
  '$views/buttons'
], function(models, albumShuffle, List, buttons) {
  'use strict';

  var button = buttons.Button.withLabel('Shuffle albums');
  var buttonElement = document.getElementById('buttonContainer');
  buttonElement.appendChild(button.node);
  buttonElement.addEventListener('click', handleClick);

  function handleClick() {
    var sourcePlaylistURI = document.getElementById('SOURCE_URI_ID').value;
    var destinationPlaylistURI = document.getElementById('DESTINATION_URI_ID').value;

    albumShuffle.shuffleAlbums(sourcePlaylistURI, destinationPlaylistURI);

    models.Playlist.fromURI(destinationPlaylistURI).load('tracks').done(function(destinationPlaylist){
      var list = List.forPlaylist(destinationPlaylist);
      var playlistElement = document.getElementById('playlistContainer');
      if (playlistElement.childNodes.length != 0)
      {
        playlistElement.childNodes.removeChild(childNodes[0]);
      }
      playlistElement.appendChild(list.node);
      list.init();
    });
  } 
});