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

  var playlistElement = document.getElementById('playlist');
  document.getElementById('inputSpan').addEventListener('mouseover', deselectInput);

  var nextAlbumButton = buttons.Button.withLabel('Play Next Album');
  var nextAlbumElement = document.getElementById('nextAlbum');
  nextAlbumElement.appendChild(nextAlbumButton.node);
  nextAlbumElement.addEventListener('click', nextAlbum);

  var nextAlbumContainer = document.getElementById('nextAlbumContainer');

  var sourceInputElement = document.getElementById('SOURCE_URI_ID');
  sourceInputElement.addEventListener('input', readSource);
  sourceInputElement.addEventListener('dragover', hideHint);
  sourceInputElement.addEventListener('mouseenter', showHint);
  sourceInputElement.addEventListener('dragleave', showHint);
  sourceInputElement.value = hintText;

  var clearSourceButtonElement = document.getElementById("clearSourceButton");
  clearSourceButtonElement.addEventListener('click', clearSourceHandler);

  function nextAlbum() {
    if (models.player.playing == true) { 
      models.player.load(['index', 'context', 'track']).done(function(currentPlayer) {
        currentPlayer.track.load('album').done(function(currentTrack) {
          models.Playlist.fromURI(currentPlayer.context.uri).load('tracks').done(function(currentPlaylist) {
            currentPlaylist.tracks.snapshot(currentPlayer.index, 30).done(function(currentShapshot) {
              var nextFound = false;
              var offset = 0;
              currentShapshot.loadAll('album').each(function(currentTrackToCheck) {
                if (nextFound == false && currentTrack.album != currentTrackToCheck.album) {
                  nextFound = true;
                  playlistList.playTrack(currentPlayer.index + offset);
                }
                offset++;
              });
            });
          });
        });
      });
    }
  }

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
        nextAlbumContainer.style.display = 'block';
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
    sourceInputElement.style.width = '165px'
    if (playlistElement.childNodes.length != 0) {
      playlistList.destroy();
    }
    clearSourceButtonElement.style.display = 'none';
    nextAlbumContainer.style.display = 'none';
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