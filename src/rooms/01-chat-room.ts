import { Room } from "colyseus";

export class ChatRoom extends Room {
    // this room supports only 4 clients connected
    maxClients = 4;

    onCreate (options) {
        console.log("ChatRoom created!", options);

        this.onMessage("message", (client, message) => {
            console.log("ChatRoom received message from", client.sessionId, ":", message);
            this.broadcast("messages", `(${client.sessionId}) ${message}`);
        });
    }

    onJoin (client) {
        this.broadcast("messages", `${ client.sessionId } joined.`);
        this.broadcast("user-connected", `${ client.sessionId }`);
    }

    onLeave (client) {
        this.broadcast("messages", `${ client.sessionId } left.`);
        this.broadcast("user-disconnected", `${ client.sessionId }`);
    }

    onDispose () {
        console.log("Dispose ChatRoom");
    }

}
