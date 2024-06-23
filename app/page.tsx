'use client';
import { useEffect, useState } from "react";
import Headline from "@/components/Headline";
import Description from "@/components/Description";
import Err from "@/components/Error";
import UserInput from "@/components/Input";
import Statistics from "@/components/Statistics";
import Result from "@/components/Result";
import Save from "@/components/Save";
import Corner from "@/components/Corner";
// import Foot from "@/components/Footer";

const Home = () => {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Waiting");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [result, setResult] = useState({ address: "", privateKey: "" });
  const [input, setInput] = useState({
    prefix: "",
    suffix: "",
    checksum: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newWorker = new Worker(
        new URL("../js/vanity.js", import.meta.url)
      );
      newWorker.onmessage = (event) => handleWorkerMessage(event.data);
      setWorker(newWorker);
    }
  }, []);

  const handleWorkerMessage = (data: any) => {
    if (data.type === "error") {
      setError(data.message);
      setStatus("Error");
    } else if (data.type === "found") {
      setResult({ address: data.address, privateKey: data.privKey });
      setStatus("Address found");
    } else if (data.type === "balance") {
      console.log(data.message);
    }
  };

  const startGen = () => {
    if (worker) {
      setError(null);
      setStatus("Running");
      worker.postMessage(input);
      setRunning(true);
    }
  };

  const stopGen = () => {
    if (worker) {
      worker.terminate();
      setWorker(null);
      setRunning(false);
      setStatus("Stopped");
    }
  };

  return (
    <div id="app" className="remodal-bg render">
      <div className="container" id="content">
        <Headline />
        <div className="row">
          <div className="col-md-12">
            <Description />
          </div>
        </div>
        {error && (
          <div className="row">
            <div className="col-md-12">
              <Err error={error} />
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <UserInput
              running={running}
              cores={4} // Example value, adjust as needed
              onStart={startGen}
              onStop={stopGen}
              onInputChange={(type, value) =>
                setInput({ ...input, [type]: value })
              }
            />
          </div>
          <div className="col-md-6">
            <Statistics
              prefix={input.prefix}
              suffix={input.suffix}
              checksum={input.checksum}
              status={status}
              firstTick={null} // Example value, adjust as needed
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Result address={result.address} privateKey={result.privateKey} />
          </div>
        </div>
      </div>
      <Save
        address={result.address.toLowerCase()}
        privateKey={result.privateKey}
      />
      {/* <Foot /> */}
      <Corner />
    </div>
  );
};

export default Home;