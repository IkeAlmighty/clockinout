import { useEffect, useState } from "react";

export default function StopWatch({ since }) {
  const [elapsed, setElapsed] = useState(Date.now() - parseInt(since));

  useEffect(
    () =>
      setInterval(() => {
        setElapsed(Date.now() - parseInt(since));
      }, 50),
    []
  );
  return <div>{elapsed}</div>;
}
