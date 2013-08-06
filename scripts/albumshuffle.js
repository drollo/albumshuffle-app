require([
  '$api/models'
], function(models) {
  'use strict';

  var shuffleAlbums = function(sourcePlaylistURI, destinationPlaylistURI) {

    var lastAlbum = null;
    var uniqueAlbumTracks = [];

    //Read tracks from source playlist and parse one track per unique album
    models.Playlist.fromURI(sourcePlaylistURI).load('tracks').done(function(sourcePlaylist){
      sourcePlaylist.tracks.snapshot().done(function(tracksSnapshot) {                              
        tracksSnapshot.loadAll('album').each(function(trackToCheck) {
          var currentAlbum = trackToCheck.album;
          if (currentAlbum != lastAlbum) {
            lastAlbum = currentAlbum;
            uniqueAlbumTracks.push(trackToCheck);
          }
        });
      });
    });

    //Shuffle the list of tracks
    shuffleArray(uniqueAlbumTracks);

    //Write the albums containing the shuffled tracks to destination playlist
    models.Playlist.fromURI(destinationPlaylistURI).load('tracks').done(function(destinationPlaylist){
      destinationPlaylist.tracks.clear();
      for (var i = 0; i < uniqueAlbumTracks.length; i++) {
        uniqueAlbumTracks[i].load('album').done(function(shuffledTrack) {
          var shuffledAlbum = shuffledTrack.album;
          shuffledAlbum.load('tracks').done(function(shuffledAlbum) {
            shuffledAlbum.tracks.snapshot().done(function(shuffledSnapshot) {
              for (var j = 0; j < shuffledSnapshot.length; j++) {
                destinationPlaylist.tracks.add(shuffledSnapshot.get(j));
              }
            });
          });
        }); 
      }
    });    
  };

  //Fisher–Yates shuffle
  function shuffleArray(array) {
    var i = array.length, j, temp;
    while (i--) {
      j = Math.floor(Math.random()*i);
      temp = array[i]
      array[i] = array[j];
      array[j] = temp;
    } 
  };

  exports.shuffleAlbums = shuffleAlbums;
});
