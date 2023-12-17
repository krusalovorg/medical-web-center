import { useContext, useEffect, useRef, useState } from "react";
import { URL_SERVER, UserData } from "../utils/backend";
import socketIo from "socket.io-client";
import UserContext from "../contexts/UserContext";
import CameraIcon from "../icons/CameraIcon";

function CallModal({ open, setOpen, selectUserData, onClose }: { open: boolean, setOpen: any, selectUserData: UserData, onClose?: any }) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [openMicro, setOpenMicro] = useState(true);
    const [openVideo, setOpenVideo] = useState(true);
    const [openVolume, setOpenVolume] = useState(true);

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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col aspect-auto w-[80%] min-h-[50%] bg-[#efefef] rounded-2xl p-5 z-[101]">
                    <div className="w-full h-[60px] flex flex-row justify-between items-center min-w-[500px]">
                        <h1 className={`text-xl text-black font-bold font-[Montserrat]`}>
                            Видеовстреча
                        </h1>
                        <svg onClick={() => {
                            setOpen(false)
                            if (onClose) {
                                onClose()
                            }
                        }} className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 4L4 20M20 20L4 4" stroke="black" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>
                    <div className="flex flex-row gap-12 w-full h-full min-h-[645px] mb-auto">
                        <div className="w-[48%] h-auto bg-black aspect-auto rounded-lg flex justify-center items-center">
                            {/* <video autoPlay muted playsInline ref={localVideoRef} /> */}
                            {/* <img src={'https://www.zdravitsa.ru/upload/services/terapevtPRO.jpg'} className="w-full h-full rounded-lg"/> */}
                            <video width="100%" height="auto" autoPlay muted controls>
                                <source src="/врач.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="w-[48%] h-auto bg-black aspect-auto rounded-lg flex justify-center items-center">
                            {/* <video autoPlay muted playsInline ref={remoteVideoRef} /> */}
                            {openVideo &&
                                <img src={'https://img.freepik.com/premium-photo/sick-man-with-headache-sitting-under-the-blanket-sick-man-with-seasonal-infections-flu_166258-850.jpg'} className="w-full h-full rounded-lg" />
                            }
                        </div>
                    </div>
                    <div className="w-full flex flex-row justify-center my-auto mt-4">
                        <div onClick={() => setOpenVideo(!openVideo)} className={`p-[20px] w-fit rounded-full cursor-pointer text-white bg-[#0067E3]`} >
                            {openVideo ?
                                <CameraIcon />
                                :
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.3999 7.97995V17.82C2.3999 19.1454 3.47442 20.22 4.7999 20.22H14.3999M5.9999 5.57995H7.1999L8.8799 2.69995H15.1199L16.7999 5.57995H19.1999C20.5254 5.57995 21.5999 6.65447 21.5999 7.97995V17.82C21.5999 18.7083 21.1173 19.4839 20.3999 19.8989M14.6832 14.7C15.2533 14.063 15.5999 13.222 15.5999 12.3C15.5999 10.3117 13.9881 8.69995 11.9999 8.69995C11.0779 8.69995 10.2368 9.04658 9.5999 9.61662M11.3999 15.8502C9.84265 15.5889 8.62441 14.3279 8.42772 12.7497M20.9999 21.3L2.9999 2.69995" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            }
                        </div>
                        <div onClick={() => setOpenMicro(!openMicro)} className={`p-[20px] ml-2 w-fit rounded-full cursor-pointer text-white bg-[#0067E3] ${openMicro && "ring-offset-2 ring-2"} ring-blue-400`} >
                            {openMicro ?
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.39795 11.177C4.66378 13.0035 5.57833 14.6733 6.9743 15.8808C8.37026 17.0883 10.1543 17.7528 12.0001 17.7528M12.0001 17.7528C13.8458 17.7528 15.6298 17.0883 17.0258 15.8808C18.4218 14.6733 19.3363 13.0035 19.6022 11.177M12.0001 17.7528V21.5999M12.0011 2.3999C11.1282 2.3999 10.291 2.74668 9.67376 3.36394C9.05649 3.9812 8.70972 4.81839 8.70972 5.69133V10.0799C8.70972 10.9528 9.05649 11.79 9.67376 12.4073C10.291 13.0246 11.1282 13.3713 12.0011 13.3713C12.8741 13.3713 13.7113 13.0246 14.3285 12.4073C14.9458 11.79 15.2926 10.9528 15.2926 10.0799V5.69133C15.2926 4.81839 14.9458 3.9812 14.3285 3.36394C13.7113 2.74668 12.8741 2.3999 12.0011 2.3999Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                :
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.17586 3.36394C9.79312 2.74668 10.6303 2.3999 11.5032 2.3999C12.3762 2.3999 13.2134 2.74668 13.8306 3.36394C14.4479 3.9812 14.7947 4.81839 14.7947 5.69133V8.9999M3.90005 11.177C4.16588 13.0035 5.08043 14.6733 6.4764 15.8808C7.87236 17.0883 9.6564 17.7528 11.5022 17.7528M11.5022 17.7528C13.3479 17.7528 15.1319 17.0883 16.5279 15.8808C17.9239 14.6733 18.8384 13.0035 19.1043 11.177M11.5022 17.7528V21.5999M8.21182 7.7999V10.0799C8.21182 10.9528 8.55859 11.79 9.17586 12.4073C9.79312 13.0246 10.6303 13.3713 11.5032 13.3713C12.0618 13.3713 12.6056 13.2294 13.0866 12.9655M3.30005 2.3999L20.7 19.7999" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            }
                        </div>
                        <div onClick={() => setOpenVolume(!openVolume)} className={`p-[20px] ml-2 w-fit rounded-full cursor-pointer text-white bg-[#0067E3]`} >
                            {openVolume ?
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.7692 9.34474C20.2486 11.1677 20.4575 13.5939 19.0503 15.7409M13.9598 5L9.07702 9.0698H4V14.9296L9.07702 14.9282L13.9598 19V5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                :
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.8827 8.5V4L12.2315 8.65121L5.5 8.65121V15.3481H9.54584M16.8827 13V20L13 16.1173M6 18.5L9.54584 15.3481M19.5 6.5L9.54584 15.3481" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            }
                        </div>

                    </div>
                </div>
                <div className="absolute w-full h-full z-[100] bg-black opacity-40" />
            </div>
        </>
    )
}

export default CallModal;