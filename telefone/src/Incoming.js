import { useEffect, useState } from "react";
import "./styles.css";

export default function Incoming(props) {
  const { session, handler } = props;
  const [callInfo] = useState(session.status);
  const answerHandler = () => {
    session.answer();
    handler();
  };
  const rejectHandler = () => {
    session.reject();
    handler();
  };
  return (
    <div className="incoming">
      <div>avatar:{callInfo.avatar || "none"}</div>
      <div>name:{callInfo.name}</div>
      <div>number:{callInfo.number}</div>
      <div>
        <button onClick={answerHandler}>answer</button>
        <button onClick={rejectHandler}>reject</button>
      </div>
    </div>
  );
}
