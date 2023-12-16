import { useContext, useEffect, useRef } from "react";
import { URL_SERVER, UserData } from "../utils/backend";
import socketIo from "socket.io-client";
import UserContext from "../contexts/UserContext";

function CallModal({ open, setOpen, selectUserData }: { open: boolean, setOpen: any, selectUserData: UserData }) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const userData = useContext(UserContext);

    const socket = socketIo(URL_SERVER, {
        autoConnect: false,
    });

    const roomName = 'voice';

    let pc: any = null; // For RTCPeerConnection Object

    const sendData = (data: any) => {
        socket.emit("data", {
            username: userData.name,
            room: roomName,
            data: data,
        });
    };

    const startConnection = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    height: 350,
                    width: 350,
                },
            })
            .then((stream) => {
                console.log("Local Stream found");
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    socket.connect();
                    socket.emit("join", { username: userData.name, room: roomName });
                }
            })
            .catch((error) => {
                console.error("Stream not found: ", error);
            });
    };

    const onIceCandidate = (event: any) => {
        if (event.candidate) {
            console.log("Sending ICE candidate");
            sendData({
                type: "candidate",
                candidate: event.candidate,
            });
        }
    };

    const onTrack = (event: any) => {
        console.log("Adding remote track");
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    const createPeerConnection = () => {
        if (localVideoRef.current) {
            try {
                pc = new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: "stun:openrelay.metered.ca:80",
                        },
                        {
                            urls: "turn:openrelay.metered.ca:80",
                            username: "openrelayproject",
                            credential: "openrelayproject",
                        },
                        {
                            urls: "turn:openrelay.metered.ca:443",
                            username: "openrelayproject",
                            credential: "openrelayproject",
                        },
                        {
                            urls: "turn:openrelay.metered.ca:443?transport=tcp",
                            username: "openrelayproject",
                            credential: "openrelayproject",
                        },
                    ],
                });
                pc.onicecandidate = onIceCandidate;
                pc.ontrack = onTrack;
                const localStream: any = localVideoRef.current.srcObject;
                for (const track of localStream.getTracks()) {
                    pc.addTrack(track, localStream);
                }
                console.log("PeerConnection created");
            } catch (error) {
                console.error("PeerConnection failed: ", error);
            }
        }
    };

    const setAndSendLocalDescription = (sessionDescription: any) => {
        pc.setLocalDescription(sessionDescription);
        console.log("Local description set");
        sendData(sessionDescription);
    };

    const sendOffer = () => {
        console.log("Sending offer");
        pc.createOffer().then(setAndSendLocalDescription, (error: any) => {
            console.error("Send offer failed: ", error);
        });
    };

    const sendAnswer = () => {
        console.log("Sending answer");
        pc.createAnswer().then(setAndSendLocalDescription, (error: any) => {
            console.error("Send answer failed: ", error);
        });
    };

    const signalingDataHandler = (data: any) => {
        if (data.type === "offer") {
            createPeerConnection();
            pc.setRemoteDescription(new RTCSessionDescription(data));
            sendAnswer();
        } else if (data.type === "answer") {
            pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.type === "candidate") {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
            console.log("Unknown Data");
        }
    };

    socket.on("ready", () => {
        console.log("Ready to Connect!");
        createPeerConnection();
        sendOffer();
    });

    socket.on("data", (data) => {
        console.log("Data received: ", data);
        signalingDataHandler(data);
    });

    useEffect(() => {
        if (open) {
            startConnection();
            return function cleanup() {
                pc?.close();
            };
        }
    }, [open]);

    if (!open) {
        return <></>
    }

    return (
        <>
            <div className="w-full h-full fixed left-0 top-0 z-[100]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] min-h-[80%] bg-[#efefef] rounded-2xl p-5 z-[101]">
                    <div className="w-full h-[60px] flex flex-row justify-between items-center min-w-[500px]">
                        <h1 className={`text-xl text-black font-bold font-[Montserrat]`}>
                            Видеозвонок
                        </h1>
                        <svg onClick={() => setOpen(false)} className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 4L4 20M20 20L4 4" stroke="black" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-row gap-12 w-full">
                        <div className="w-[48%] h-full">
                            <video autoPlay muted playsInline ref={localVideoRef} />
                        </div>
                        <div className="w-[48%] h-full">
                            <video autoPlay muted playsInline ref={remoteVideoRef} />
                        </div>
                    </div>
                </div>
                <div className="absolute w-full h-full z-[100] bg-black opacity-40" />
            </div>
        </>
    )
}

export default CallModal;