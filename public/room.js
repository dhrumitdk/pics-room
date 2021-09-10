// JS for frontend lives here...

// Import statements
const socket = io("/");

const videoGrid = document.getElementById("video-grid"); // Getting video-grid div
const myVideo = document.createElement("video"); // Creating video element in HTML
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: "/peerjs", // Coming from server
  host: "/",
  port: "4000", // On same port as express server
});

// Gets video and audio from chrome
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream); // Passing video element and stream to addVideoStream()

    // Answering a call from new user and add stream
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // Gets executed when user connected emits
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream); // Passing user id and user's stream from promise above to connectToNewUser()
    });
  });

// Emitting join room event
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id); // Passing room id on joining the room
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream); // Calling user id and sending own stream
  const video = document.createElement("video"); // Creating video element for new user
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream); // Adding user's stream
  });
};

// Adding video stream
const addVideoStream = (video, stream) => {
  video.srcObject = stream; // Adding stream to video source
  video.addEventListener("loadedmetadata", () => {
    video.play(); // Plays video when video data is loaded
  });
  videoGrid.append(video); // Appending video to video-grid div
};