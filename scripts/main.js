require([
  '$api/models',
  'scripts/albumshuffle',
  '$views/list#List',
  '$views/buttons'
], function(models, albumShuffle, List, buttons) {
  'use strict';

  var button = buttons.Button.withLabel('Shuffle albums');
  document.getElementById('buttonContainer').appendChild(button.node);
  document.getElementById('buttonContainer').addEventListener('click', handleClick);

  function handleClick() {
    var sourcePlaylistURI = document.getElementById('SOURCE_URI_ID').value;
    var destinationPlaylistURI = document.getElementById('DESTINATION_URI_ID').value;

    albumShuffle.shuffleAlbums(sourcePlaylistURI, destinationPlaylistURI);

    models.Playlist.fromURI(destinationPlaylistURI).load('tracks').done(function(destinationPlaylist){
      var list = List.forPlaylist(destinationPlaylist);
      var childNodes = document.getElementById('playlistContainer').childNodes;
      if (childNodes.length != 0)
      {
        childNodes.removeChild(childNodes[0])
      }
      document.getElementById('playlistContainer').appendChild(list.node);
      list.init();
    });
  } 
});