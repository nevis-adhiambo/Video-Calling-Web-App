let remoteContainer = document.getElementById("remote-container");
let channelName = localStorage.getItem("channelname");


//error handling
let handleFail = function(err) {
    console.log("Error:", err);
}


//leaving the call
document.getElementById("disconnect-call").onclick = () => {
    disconnectCall();
}

function disconnectCall() {
    client.leave();
    if (client.leave()) {
        console.log("client left");
        window.location.href = "..index.html";
    }
}

//Muting  and unmuting mic
var isMuted = false;
document.getElementById("mute-mic").onclick = () => {
    toggleMic();
}

function toggleMic() {
    if (isMuted) {
        globalStream.unmuteAudio();
        isMuted = false;
    } else {
        globalStream.muteAudio();
        isMuted = true;
    }
}


//enabling and disabling camera
var isCameraOn = false;
document.getElementById("disable-camera").onclick = () => {
    toggleCamera();
}

function toggleCamera() {
    if (isCameraOn) {
        globalStream.muteVideo();
        isCameraOn = false;
    } else {
        globalStream.unmuteVideo();
        isCameraOn = true;
    }
}

//leaving the call
function removeVideoStream(evt) {
    let stream = evt.stream;
    stream.stop();
    let removeDiv = document.getElementById("remote-container");
    removeDiv.parentNode.removeChild(removeDiv);
    console.log("Remote stream removed");
}

//creating the client
let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264",
});

//creating the stream
var stream = AgoraRTC.createStream({
    streamID: 0,
    audio: true,
    video: true,
    screen: false,

})

//initializing 
client.init("2a127d0dea9145c09b5c86d854b0da87", function() {
    console.log("success!");
})


//joining the call and adding another stream to the call
client.join(null, channelName, null, function(uid) {
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false,

    });
    globalStream = localStream;
    localStream.init(function(params) {
        localStream.play("me");
        client.publish(localStream, handleFail);

        client.on("stream-added", (evt) => {
            client.subscribe(evt.stream, handleFail);
        });
        client.on("stream-subscribed", (evt) => {
            let stream = evt.stream;
            stream.play("remote-container")
        });
    })
}, handleFail);