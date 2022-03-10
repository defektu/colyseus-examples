var host = window.document.location.host.replace(/:.*/, '');

var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
client.joinOrCreate("chat").then(room => {
    console.log("joined");
    room.onStateChange.once(function(state) {
        console.log("initial room state:", state);
    });

    // new room state
    room.onStateChange(function(state) {
        // this signal is triggered on each patch
    });

    // listen to patches coming from the server
    room.onMessage("messages", function(message) {
        var p = document.createElement("p");
        p.innerText = message;
        document.querySelector("#messages").appendChild(p);
    });
    room.onMessage("user-connected", function(message) {
        console.log("user-connected");
        console.log(message);
    });
    room.onMessage("user-disconnected", function(message) {
        console.log("user-disconnected");
        console.log(message);
    });
    room.onMessage("join-room", function(message) {
        console.log("join-room");
        console.log(message);
    });


    // send message to room on submit
    document.querySelector("#form").onsubmit = function(e) {
        e.preventDefault();

        var input = document.querySelector("#input");

        console.log("input:", input.value);

        // send data to room
        room.send("message", input.value);

        // clear input
        input.value = "";
    }

    const videoGrid = document.getElementById('video-grid')

    //const myPeer = new Peer(undefined, {})
    const myPeer = new Peer(room.sessionId)
    const myVideo = document.createElement('video')
    myVideo.muted = true

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)
        console.log(room)
        myPeer.on('call', call => {
            console.log("peer on call");
            call.answer(stream)
            const video = document.createElement('video')
            video.id = call.peer
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })
        room.onMessage("user-connected", userId => {
            connectToNewUser(userId, stream);
            console.log("newuser: " + userId);
        });
        room.onMessage("user-disconnected", userId => {
            console.log("disconnected: " + userId)
            disconnectUser(userId);
        });

    })

    myPeer.on('open', id => {
        console.log("peer open")
        console.log(id)

        //socket.emit('join-room', ROOM_ID, id)
    })


    function connectToNewUser(userId, stream) {
        console.log("calling id: " + userId)
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video')
        video.id = userId
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
            console.log("streamer: " + userId)
        })
        call.on('close', () => {
            console.log("close conn")
            video.remove()
        })
        call.on('disconnected', () => {
            console.log("close conn")
            video.remove()
        })
    }

    function disconnectUser(userId) {
        const video = document.getElementById(userId)
        video.remove()
    }



    function addVideoStream(video, stream) {
        console.log("addstream")
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        videoGrid.append(video)
    }

});