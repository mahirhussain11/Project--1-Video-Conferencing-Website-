let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let config = {
  appid: "d62e4b478ad34a459e625b81d6fbf01a",
  token:
    "007eJxTYFg/MeXX6rNXjnGoN/DVz/G6aK69us+ln8fmXEeUlWr2FC8FhhQzo1STJBNzi8QUY5NEE1PLVDMj0yQLwxSztKQ0A8NE02/JaQ2BjAw1dyuYGBkgEMTnYsjJLEstLilKTcxlYAAA8eAhlw==",
  uid: null,
  channel: "livestream",
};

let localTracks = {
  audioTrack: null,
  videoTrack: null,
};
let localTrackState = {
  audioTrackMuted: false,
  videoTrackMuted: false,
};
let remoteTracks = {};

document.getElementById("join-btn").addEventListener("click", async () => {
  console.log("User Joined stram");
  await joinStreams();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("footer").style.display = "flex";
});

let joinStreams = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  [config.uid, localTracks.audioTrack, localTracks.videoTrack] =
    await Promise.all([
      client.join(
        config.appid,
        config.channel,
        config.token || null,
        config.uid || null
      ),
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

  let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                      <p class="user-uid">${config.uid}</p>
                      <div class="video-player player" id="stream-${config.uid}"></div>
                </div>`;

  document
    .getElementById("user-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks.videoTrack.play(`stream-${config.uid}`);

  await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
};

let handleUserLeft = async () => {
  console.log("User has Left");
  delete remoteTracks[user.uid];
  document.getElementById(`video-wrapper-${user.uid}`).remove();
};

let handleUserJoined = async (user, mediaType) => {
  console.log("Handle user joined");

  remoteTracks[user.uid] = user;

  await client.subscribe(user, mediaType);
  let videoPlayer = document.getElementById("video-wrapper-${user.uid}");
  if (videoPlayer != null) {
    videoPlayer.remove();
  }

  if (mediaType === "video") {
    let videoPlayer = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <div  class="video-player player" id="stream-${user.uid}"></div>
                      </div>`;
    document
      .getElementById("user-streams")
      .insertAdjacentHTML("beforeend", videoPlayer);
    user.videoTrack.play(`stream-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

document.getElementById("leave-btn").addEventListener("click", async () => {
  for (trackName in localTracks) {
    let track = localTracks[trackName];
    if (track) {
      //stops camera and mic
      track.stop();
      //disconnects from your camera and mic
      track.close();
      localTracks[trackName] = null;
    }
  }

  await client.leave();
  document.getElementById("user-streams").innerHTML = "";
  document.getElementById("footer").style.display = "none";
  document.getElementById("join-btn").style.display = "block";
});

document.getElementById("mic-btn").addEventListener("click", async () => {
  if (!localTrackState.audioTrackMuted) {
    await localTracks.audioTrack.setMuted(true);
    localTrackState.audioTrackMuted = true;
    document.getElementById("mic-btn").style.backgroundColor = "red";
  } else {
    await localTracks.audioTrack.setMuted(false);
    localTrackState.audioTrackMuted = false;
    document.getElementById("mic-btn").style.backgroundColor = "#1f1f1f8e";
  }
});

document.getElementById("camera-btn").addEventListener("click", async () => {
  if (!localTrackState.videoTrackMuted) {
    await localTracks.videoTrack.setMuted(true);
    localTrackState.videoTrackMuted = true;
    document.getElementById("camera-btn").style.backgroundColor = "red";
  } else {
    await localTracks.videoTrack.setMuted(false);
    localTrackState.videoTrackMuted = false;
    document.getElementById("camera-btn").style.backgroundColor = "#1f1f1f8e";
  }
});
