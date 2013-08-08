require([
  '$api/models',
  '$api/library',
  'scripts/albumshuffle',
  '$views/buttons',
  '$views/list'
], function(models, library, albumShuffle, buttons, list) {
  'use strict';

  var sourceInputElement = document.getElementById('SOURCE_URI_ID');
  sourceInputElement.addEventListener('input', readSource);

  var playlistList;

  var clearSourceButtonElement = document.getElementById("clearSourceButton");
  clearSourceButtonElement.addEventListener('click', clearSourceHandler);

  function readSource() {
    var sourcePlaylistURI = sourceInputElement.value;
    if (sourcePlaylistURI != "") {
      models.Playlist.fromURI(sourcePlaylistURI).load('name').done(function(sourcePlaylist) {
        sourceInputElement.value = sourcePlaylist.name;
        sourceInputElement.disabled = true;
        shuffleHandler(sourcePlaylistURI);
      }).fail(function() {
        sourceInputElement.value = "";
      });
    }
  }

  function clearSourceHandler() {
    sourceInputElement.value = "";
    sourceInputElement.disabled = false;
  }

  function shuffleHandler(sourcePlaylistURI) {
    var destinationName = "Album shuffler";
    var destinationPlaylist = null;
    var playlistFound = false;
    var userLibrary = library.Library.forCurrentUser();
    
    var playlistElement = document.getElementById('playlistContainer');
    if (playlistElement.childNodes.length != 0) {
      playlistList.destroy();
    }

    var sourcePlaylist = models.Playlist.fromURI(sourcePlaylistURI);
    userLibrary.load('playlists').done(function(playlists) {
      userLibrary.playlists.snapshot().done(function(librarySnapshot) {
        librarySnapshot.loadAll('name').each(function(snapshotPlaylist) {
          if (snapshotPlaylist.name == destinationName) {
            playlistFound = true;
            snapshotPlaylist.load('tracks').done(function(tracksplaylist) {
              tracksplaylist.tracks.clear();
            });
            albumShuffle.shuffleAlbums(sourcePlaylist, snapshotPlaylist);
            playlistList = list.List.forPlaylist(snapshotPlaylist);
          }
        });

      });
    if (playlistFound == false) {
      models.Playlist.create(destinationName).done(function(newPlaylist) {         
        albumShuffle.shuffleAlbums(sourcePlaylist, newPlaylist);
        playlistList = list.List.forPlaylist(newPlaylist);
      });  
    }
    playlistElement.appendChild(playlistList.node);
    playlistList.init();
  });
  }
});