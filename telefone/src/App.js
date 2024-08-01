import { useEffect, useState } from "react";
import { init } from "ys-webrtc-sdk-core";
import Session from "./Session";
import Incoming from "./Incoming";
import "./styles.css";

export default function App() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState(null);
  const [pbx, setPbx] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [incomings, setIncoming] = useState([]);
  const [cause, setCause] = useState("");
  const onNumberChange = (e) => {
    setNumber(e.target.value);
  };
  // outgoing call handler.
  const callHandler = () => {
    if (!phone || !number) return;
    phone.call(number);
    setCause("");
  };
  const deleteIncoming = () => {
    setIncoming([]);
  };
  // init sdk-core.
  useEffect(() => {
    /**
     * Change the init options to yours
     * and start previewing.
     */
    init({
      username: "12345", // your extension
      // secret get form pbx
      secret:
        "secret key",
      pbxURL: "https://yourpbxurl.com", // your pbx URL
      disableCallWaiting: true // disabled call waiting,only handle one call.
    })
      .then(({ phone, pbx, destroy }) => {
        phone.start();
        setPhone(phone);
        setPbx(pbx);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (!phone) return;
    // listen startSession event and show ui.
    const startSession = ({ callId, session }) => {
      setSessions(Array.from(phone.sessions.values()));
    };

    const deleteSession = ({ callId, cause }) => {
      // here can handle session deleted event.
      setCause(cause);
      setSessions(Array.from(phone.sessions.values()));
    };
    const incoming = ({ callId, session }) => {
      // This example disabled call waiting, only handle one call.
      // So here just handle one incoming call.
      setIncoming([session]);
    };
    phone.on("startSession", startSession);
    phone.on("deleteSession", deleteSession);
    phone.on("incoming", incoming);
    return () => {
      phone.removeListener("startSession", startSession);
      phone.removeListener("deleteSession", deleteSession);
      phone.removeListener("incoming", incoming);
    };
  }, [phone]);

  useEffect(() => {
    if (!pbx) return;
    const runtimeErrorHanlder = (reason) => {
      const { code, message } = reason;
      console.error(`pbx runtime erroe, code: ${code} message: ${message}.`);
      // Sdk inside will destroy.
      // You should do something， Like re-init the sdk.
      // Your logic...
    };
    pbx.on("runtimeError", runtimeErrorHanlder);

    return () => {
      pbx.removeListener("runtimeError", runtimeErrorHanlder);
    };
  }, [pbx]);
  return (
    <div className="App">
      <h1>test ys-webrtc-sdk-core</h1>
      <div>
        <input type="text" value={number} onChange={onNumberChange} />
        <button onClick={callHandler}>call</button>
      </div>
      {incomings.map((session) => (
        <Incoming
          key={session.status.callId}
          session={session}
          handler={() => {
            deleteIncoming();
          }}
        />
      ))}
      {sessions.map((session) => {
        return <Session key={session.status.callId} session={session} />;
      })}
      {cause && <div> phone call end, Cause: {cause} </div>}
      <div className="auth-invalid-tip">
        PS: If the error ‘ERR_CERT_AUTHORITY_INVALID’ is reported in the
        console, it may be caused by the PBX not using a secure certificate.
        Please visit your PBX URL first, agree to the risk and continue.
      </div>
    </div>
  );
}
