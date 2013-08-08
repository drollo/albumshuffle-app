require([
  '$api/models',
  '$api/library',
  'scripts/albumshuffle#shuffleAlbums',
  '$views/buttons',
  '$views/list'
], function(models, library, shuffleAlbums, buttons, list) {
  'use strict';

  var hintText = 'Drag playlist here';
  var nameColor = 'rgba(0,0,0,0.6)';
  var hintColor = 'rgba(0,0,0,0.2)';
  var playlistList;

  var playlistElement = document.getElementById('playlistContainer');
  document.getElementById('inputSpan').addEventListener('mouseover', deselectInput);

  var sourceInputElement = document.getElementById('SOURCE_URI_ID');
  sourceInputElement.addEventListener('input', readSource);
  sourceInputElement.addEventListener('dragover', hideHint);
  sourceInputElement.addEventListener('mouseenter', showHint);
  sourceInputElement.addEventListener('dragleave', showHint);
  sourceInputElement.value = hintText;

  var clearSourceButtonElement = document.getElementById("clearSourceButton");
  clearSourceButtonElement.addEventListener('click', clearSourceHandler);

  function deselectInput() {
    window.getSelection().empty();
  }

  function hideHint() {
    sourceInputElement.value = "";
  }

  function showHint() {
    if (sourceInputElement.value == "") {
      sourceInputElement.value = hintText;
    }
  }
  
  function readSource() {
    var sourcePlaylistURI = sourceInputElement.value;
    if (sourcePlaylistURI != "") {
      models.Playlist.fromURI(sourcePlaylistURI).load('name').done(function(sourcePlaylist) {
        sourceInputElement.style.color = nameColor;
        sourceInputElement.value = sourcePlaylist.name;
        sourceInputElement.style.width = (sourceInputElement.value.length * 12).toString() + 'px';
        sourceInputElement.disabled = true;
        clearSourceButtonElement.style.display = 'block';
        shuffleHandler(sourcePlaylistURI);
      }).fail(function() {
        sourceInputElement.value = hintText;
      });
    }
  }

  function clearSourceHandler() {
    sourceInputElement.value = hintText;
    sourceInputElement.style.color = hintColor;
    sourceInputElement.disabled = false;
    sourceInputElement.style.width = '190px'
    if (playlistElement.childNodes.length != 0) {
      playlistList.destroy();
    }
    clearSourceButtonElement.style.display = 'none';
  }

  function shuffleHandler(sourcePlaylistURI) {
    var destinationName = "Album shuffler";
    var destinationPlaylist = null;
    var playlistFound = false;
    var userLibrary = library.Library.forCurrentUser();

    var sourcePlaylist = models.Playlist.fromURI(sourcePlaylistURI);
    userLibrary.load('playlists').done(function(playlists) {
      userLibrary.playlists.snapshot().done(function(librarySnapshot) {
        librarySnapshot.loadAll('name').each(function(snapshotPlaylist) {
          if (snapshotPlaylist.name == destinationName) {
            playlistFound = true;
            snapshotPlaylist.load('tracks').done(function(tracksplaylist) {
              tracksplaylist.tracks.clear();
            });
            shuffleAlbums(sourcePlaylist, snapshotPlaylist);
            playlistList = list.List.forPlaylist(snapshotPlaylist, {style: 'rounded'});
          }
        });
      });
      if (playlistFound == false) {
        models.Playlist.create(destinationName).done(function(newPlaylist) {         
          shuffleAlbums(sourcePlaylist, newPlaylist);
          playlistList = list.List.forPlaylist(newPlaylist, {style: 'rounded'});
        });  
      }
      playlistElement.appendChild(playlistList.node);
      playlistList.init();
    });
  }
});