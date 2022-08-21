import { useEffect, useState } from "react";

import { prettifyMs } from "../time";

export default function StopWatch({ since }) {
  if (!since) return <div className="select-none">00 : 00 : 00</div>;

  const [elapsed, setElapsed] = useState(Date.now() - parseInt(since));

  useEffect(
    () =>
      setInterval(() => {
        setElapsed(Date.now() - parseInt(since));
      }, 50),
    []
  );
  return <div className="select-none">{prettifyMs(elapsed)}</div>;
}
