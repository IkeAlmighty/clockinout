import LoginButton from "../lib/components/LoginButton";
import LogoutButton from "../lib/components/LogoutButton";
import StopWatch from "../lib/components/StopWatch";

import { prettifyMs } from "../lib/time";

import Head from "next/head";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const [punchMode, setPunchMode] = useState("none");
  const [punchInTime, setPunchInTime] = useState(undefined);
  const [punches, setPunches] = useState([]);

  const [labelUpdateStack, setLabelUpdateStack] = useState([]);
  const lastLabelResolveTimeStamp = useRef();

  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
    useState(false);

  // labels, mapped to the punchIn id associated with the label:
  const [labels, setLabels] = useState({});

  // when a new user loads, make sure to get the user's current
  // punch status
  useEffect(() => {
    async function fetchAndSetPunchStatus() {
      if (!user) return;
      const status = await getPunchStatus(user);
      setPunchMode(status.mode);
      setPunchInTime(status.time);
    }

    fetchAndSetPunchStatus();
  }, [user]);

  useEffect(() => {
    async function fetchAndSetPunches() {
      if (!user) return;
      const listPunchesResponse = await fetch(
        `/api/punch/list?email=${user.email}`
      );
      const punches = await listPunchesResponse.json();

      setPunches(punches);

      // also set the labels state:
      punches.forEach((punch) => {
        if (punch.mode === "in") {
          labels[punch._id] = punch.label;
        }
      });

      // call for rerender:
      setLabels({ ...labels });
    }

    fetchAndSetPunches();
  }, [punchMode]);

  // helper function to get a user's punch status aka 'mode'
  async function getPunchStatus(user) {
    const punchStatusResponse = await fetch(
      `/api/punch/status?email=${user.email}`
    );

    if (punchStatusResponse.ok) {
      return await punchStatusResponse.json();
    } else {
      toast("Server Error while getting punch status", { autoClose: false });
      return "none";
    }
  }

  // logs either a punch-in or punch-out based on the mode ('in' or 'out') passed
  async function logTime(userData, time, mode) {
    const waitingMsg = toast("waiting for server...", {
      position: toast.POSITION.BOTTOM_CENTER,
    });
    const punchResponse = await fetch("api/punch", {
      method: "POST",
      body: JSON.stringify({ user: userData, time, mode }),
    });

    toast.dismiss(waitingMsg);

    if (punchResponse.ok) {
      toast(`Successful Clock-${punchMode}. Good Job!`, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      setPunchMode(punchMode === "in" ? "out" : "in");
      setPunchInTime(punchMode === "in" ? time : undefined);
    } else {
      toast("Seems like there was a server error. Try punching in again.", {
        autoClose: false,
      });
    }
  }

  async function removePunches(_id1, _id2) {
    // removes the 2 give punches (designed to remove an in and out punch)
    // first, send a post request to /api/punches/delete

    let punchDeleteResponse = await fetch("/api/punch/delete", {
      method: "DELETE",
      body: JSON.stringify({ _id1, _id2 }),
    });

    if (punchDeleteResponse.ok) {
      // then, remove the punches from the ui:
      setPunches(
        punches.filter((punch) => punch._id !== _id1 && punch._id !== _id2)
      );
    } else {
      toast("Server Error when trying to delete punches");
    }
  }

  // resolves such that each label is updated once per id, and
  // all other update requests per label id are discarded on the backend
  async function resolveLabelUpdates() {
    // NOTE: only labels attached to a punch of mode 'in' will be displayed
    // in the user interface

    const body = JSON.stringify({ stack: labelUpdateStack });

    let labelUpdateResponse = await fetch("/api/punch/resolve-labels", {
      method: "POST",
      body,
    });

    if (labelUpdateResponse.ok) {
      // clear the update stack:
      setLabelUpdateStack([]);
    }
  }

  async function attemptLabelResolve() {
    // this function waits for several seconds, and then
    // runs resolveLabelUpdates if there hasn't been an
    // update during that wait time
    lastLabelResolveTimeStamp.current = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // check to see when the last update was:
    if (
      lastLabelResolveTimeStamp.current &&
      Date.now() - lastLabelResolveTimeStamp.current >= 3000
    ) {
      lastLabelResolveTimeStamp.current = undefined;
      resolveLabelUpdates();
    }
  }

  useEffect(() => attemptLabelResolve(), [labelUpdateStack]);

  function createAndDownloadCSV() {
    // first, create a matrix of relevant punch data:

    const matrix = [
      [
        "Time Elapsed",
        "Label",
        "Punch In Time",
        "Punch Out Time",
        "Punch In Date",
        "Punch Out Date",
      ],
    ];

    // populate the matrix:
    punches.forEach((punchOut, index) => {
      if (punchOut.mode === "out" && index + 1 < punches.length) {
        const punchIn = punches[index + 1];

        const elapsed = punchOut.time - punchIn.time;
        const label = punchIn.label;

        const inTime = new Date(punchIn.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const outTime = new Date(punchOut.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const inDate = new Date(punchIn.time).toLocaleDateString();
        const outDate = new Date(punchOut.time).toLocaleDateString();

        matrix.push([elapsed, label, inTime, outTime, inDate, outDate]);
      }
    });

    // create the csv file:
    const content =
      "data:text/csv;charset=utf-8," +
      matrix.map((row) => row.join()).join("\r\n");

    const encodedURI = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);

    // get the earliest punch out and the latest punch out
    // (so we can name the csv document appropriately)
    let earliestPunchTime;
    let latestPunchTime;

    punches.forEach((punch) => {
      if (punch.mode === "out") {
        if (punch.time < earliestPunchTime || !earliestPunchTime) {
          earliestPunchTime = punch.time;
        }

        if (punch.time > latestPunchTime || !latestPunchTime) {
          latestPunchTime = punch.time;
        }
      }
    });

    // set the name of file:
    link.setAttribute(
      "download",
      `${new Date(earliestPunchTime).toLocaleDateString()}_to_${new Date(
        latestPunchTime
      ).toLocaleDateString()}`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function deleteAllPunches() {
    if (punchMode === "out") {
      toast("Please Punch Out before deleting");
      setShowDeleteAllConfirmation(false);
      return;
    }

    let deleteAllResponse = await fetch("/api/punch/delete-all", {
      method: "DELETE",
      body: JSON.stringify({ email: user.email }),
    });

    if (deleteAllPunches.ok) {
      toast("successfully clocked out!");
    }

    // update ui:
    setShowDeleteAllConfirmation(false);
    setPunches([]);
  }

  if (isLoading) return <div>Loading........ :&#41;</div>;

  return (
    <div>
      <Head>
        <title>Clock In/Out</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-right p-1 bg-violet-100">
        <div className="inline-block float-left m-2">
          <h1>Clock In/Out</h1>
        </div>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && <LogoutButton />}
      </div>

      <div className="p-3 max-w-lg mx-auto">
        {isAuthenticated ? (
          <div>
            <div className="text-center mt-10">
              {punchMode === "in" && (
                <button onClick={() => logTime(user, Date.now(), punchMode)}>
                  PUNCH IN
                </button>
              )}

              {punchMode === "out" && (
                <button onClick={() => logTime(user, Date.now(), punchMode)}>
                  PUNCH OUT!!!!!
                </button>
              )}
            </div>

            <div className="text-center mb-10 mt-5 text-2xl">
              <StopWatch since={punchInTime} />
            </div>

            {/* CSV EXPORT ALL */}
            <div>
              <span
                onClick={() => createAndDownloadCSV()}
                className="text-green-600 cursor-pointer select-none text-left"
              >
                export as csv
              </span>

              {showDeleteAllConfirmation && (
                <div className="text-right">
                  <span>you sure???</span>
                  <span
                    onClick={() => deleteAllPunches()}
                    className="text-red-500 mx-6 cursor-pointer select-none"
                  >
                    yes
                  </span>
                  <span
                    onClick={() => setShowDeleteAllConfirmation(false)}
                    className="text-blue-600 mx-6 cursor-pointer select-none"
                  >
                    no
                  </span>
                </div>
              )}

              <div className="text-right cursor-pointer select-none text-red-500">
                {!showDeleteAllConfirmation && (
                  <span onClick={() => setShowDeleteAllConfirmation(true)}>
                    delete all entries
                  </span>
                )}
              </div>
            </div>

            {/* LIST PUNCH INFO */}
            <div className="my-2">
              {punches.map((punch, index) => {
                if (punch.mode === "out" && index + 1 < punches.length) {
                  const elapsed = punch.time - punches[index + 1].time;

                  const punchIn = punches[index + 1];
                  const punchOut = punch;

                  // helper component
                  function PunchDataComponent({ datetime, mode }) {
                    return (
                      <div className="text-slate-600">
                        <div className="inline-block px-1 w-[125px]">
                          Punched {mode}:{" "}
                        </div>
                        <div className="inline-block px-1">
                          {datetime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="inline-block px-1">
                          {datetime.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${punchOut._id}_${punchIn._id}`}
                      className="my-10"
                    >
                      <div className="pr-1 block mx-1 min-w-[200px] text-xl">
                        {prettifyMs(elapsed)}
                      </div>
                      <div className="inline-block">
                        <input
                          className="py-1 px-3"
                          type="text"
                          value={labels[punchIn._id] || ""}
                          onChange={(e) => {
                            setLabelUpdateStack([
                              { punchInId: punchIn._id, value: e.target.value },
                              ...labelUpdateStack,
                            ]);
                            labels[punchIn._id] = e.target.value;
                            setLabels({ ...labels }); // to trigger rerender
                          }}
                          placeholder="add a label!"
                        />
                      </div>
                      <div
                        onClick={() => removePunches(punchOut._id, punchIn._id)}
                        className="float-right cursor-pointer select-none mx-2 inline-block text-red-500"
                      >
                        x
                      </div>

                      <PunchDataComponent
                        datetime={new Date(punchIn.time)}
                        mode="in"
                      />

                      <PunchDataComponent
                        datetime={new Date(punchOut.time)}
                        mode="out"
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ) : (
          <div>
            This app requires you to login via Auth0. Click the "Login" button
            above, and use the following credentials to test the app out:
            <h3>email: test@ikecraft.net</h3>
            <h3>password: test!!1234</h3>
          </div>
        )}
      </div>
    </div>
  );
}
