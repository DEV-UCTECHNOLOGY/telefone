import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function Session(props) {
  const { session } = props;
  const [callInfo, setCallInfo] = useState(session.status);
  const [callStatus, setCallStatus] = useState(session.status.callStatus);
  const [timer, setTimer] = useState(session.timer);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteAudioRef = useRef(null);
  const hangupHandler = () => {
    session.terminate("hangup");
  };
  // confirmed
  useEffect(() => {
    const handler = ({ callId, session }) => {
      console.log(`callId: ${callId} has been confirmed.`);
      setCallStatus(session.status.callStatus);
    };
    session.on("confirmed", handler);
    return () => {
      session.removeListener("confirmed", handler);
    };
  }, [session]);
  // accepted
  useEffect(() => {
    const handler = ({ callId, session }) => {
      console.log(`callId: ${callId} has been accepted.`);
      setCallStatus(session.status.callStatus);
    };
    session.on("accepted", handler);
    return () => {
      session.removeListener("accepted", handler);
    };
  }, [session]);
  // failed
  useEffect(() => {
    const handler = ({ callId, cause }) => {
      console.log(`callId: ${callId} has been failed. cause:${cause}`);
    };
    session.on("failed", handler);
    return () => {
      session.removeListener("failed", handler);
    };
  }, [session]);
  // ended
  useEffect(() => {
    const handler = ({ callId, cause }) => {
      console.log(`callId: ${callId} has been ended.`);
    };
    session.on("ended", handler);
    return () => {
      session.removeListener("ended", handler);
    };
  }, [session]);
  // timer update.
  useEffect(() => {
    const handler = ({ callId, timer: newTimer }) => {
      setTimer({ ...newTimer });
    };
    session.on("updateTimer", handler);
    return () => {
      session.removeListener("updateTimer", handler);
    };
  }, [session]);
  // status changed.
  useEffect(() => {
    const handler = (newStatus, oldStatus) => {
      console.log(`callId: ${newStatus.callId} status change.`);
      setCallInfo(newStatus);
    };
    session.on("statusChange", handler);
    return () => {
      session.removeListener("statusChange", handler);
    };
  }, [session]);
  // handle remote stream
  useEffect(() => {
    const handler = ({ remoteStream }) => {
      if (!remoteStream?.getTracks?.()) return;
      setRemoteStream(remoteStream);
    };
    session.on("updateRemoteStream", handler);
    return () => {
      session.removeListener("updateRemoteStream", handler);
    };
  }, [session]);
  // set audio stream
  useEffect(() => {
    if (!remoteStream) return;
    const audioTracks = remoteStream.getAudioTracks();
    if (audioTracks) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);
  return (
    <div className="session">
      {callInfo.avatar ? (
        <img src={callInfo.avatar} width={60} height={60} alt="avatar" />
      ) : (
        "none avatar"
      )}
      <div>call id: {callInfo.callId}</div>
      <div>name: {callInfo.name}</div>
      <div>number: {callInfo.number}</div>
      <div>{callStatus}</div>
      <div>
        {callStatus === "ringing" && "ringing:" + timer.ringDuration}
        {(callStatus === "calling" || callStatus === "connecting") &&
          "calling:" + timer.callingDuration}
        {callStatus === "talking" && "talking:" + timer.callDuration}
        {callInfo.isHold && "hold:" + timer.holdDuration}
      </div>
      <audio ref={remoteAudioRef} autoPlay />
      <button onClick={hangupHandler}>hangup</button>
    </div>
  );
}
