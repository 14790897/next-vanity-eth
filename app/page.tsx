"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Headline from "@/components/Headline";
import Description from "@/components/Description";
import Err from "@/components/Error";
import UserInput from "@/components/Input";
import Statistics from "@/components/Statistics";
import Result from "@/components/Result";
import Save from "@/components/Save";
import Corner from "@/components/Corner";
import Foot from "@/components/Footer";

const Home = () => {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Waiting");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [threads, setThreads] = useState(4);
  const [cores, setCores] = useState(0);
  const [result, setResult] = useState({ address: "", privateKey: "" });
  const [input, setInput] = useState({
    prefix: "",
    suffix: "",
    checksum: true,
  });
  const [firstTick, setFirstTick] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkLocation();
      countCores();
      initWorkers();
    }
  }, []);

  useEffect(() => {
    if (!running) {
      initWorkers();
    }
  }, [threads]);

  const handleWorkerMessage = (data: any) => {
    if (data.type === "error") {
      setError(data.message);
      setStatus("Error");
      toast.error(data.message);
    } else if (data.type === "found") {
      setResult({ address: data.address, privateKey: data.privKey });
      setStatus("Address found");
      toast.success("Address found!");
    } else if (data.type === "balance") {
      console.log(data.message);
    }

    if (data.error) {
      stopGen();
      setError(data.error);
      setStatus("Error");
      toast.error(data.error);
    }

    if (data.address) {
      stopGen();
      displayResult(data);
      toast.success("Address found!");
    }
  };

  const startGen = () => {
    if (typeof window !== "undefined" && window.Worker) {
      clearResult();
      setRunning(true);
      setStatus("Running");
      setFirstTick(performance.now());
      toast.info("Generation started...");

      workers.forEach((worker) => {
        worker.postMessage({ ...input, stopSignal: false });
      });
    } else {
      setError("workers_unsupported");
      toast.error("Web Workers are not supported in your environment.");
    }
  };

  const stopGen = () => {
    setRunning(false);
    setStatus("Stopped");
    workers.forEach((worker) => worker.postMessage({ stopSignal: true }));
    setWorkers([]);
    toast.info("Generation stopped.");
  };

  const clearResult = () => {
    setResult({ address: "", privateKey: "" });
  };

  const displayResult = (result: any) => {
    setResult({ address: result.address, privateKey: result.privKey });
    setStatus("Address found");
  };

  const initWorkers = () => {
    if (workers.length === threads) return;

    if (workers.length > threads) {
      workers.slice(threads).forEach((worker) => worker.terminate());
      setWorkers(workers.slice(0, threads));
      return;
    }

    const newWorkers = [...workers];
    for (let w = workers.length; w < threads; w++) {
      try {
        const worker = new Worker(new URL("../js/vanity.js", import.meta.url));
        worker.onmessage = (event) => handleWorkerMessage(event.data);
        newWorkers.push(worker);
      } catch (err) {
        setError(err.message);
        setStatus("Error");
        toast.error(err.message);
        console.error(err);
        break;
      }
    }
    setWorkers(newWorkers);
  };

  const countCores = () => {
    try {
      const coreCount = navigator.hardwareConcurrency || 4;
      setCores(coreCount);
      setThreads(coreCount);
    } catch (err) {
      console.error(err);
    }
  };

  const checkLocation = () => {
    try {
      setError(window.self !== window.top ? "insecure_location" : error);
      if (window.self !== window.top) {
        toast.error("Insecure location: Running in an iframe.");
      }
    } catch {
      setError("insecure_location");
      toast.error("Insecure location: Error checking top window.");
    }
    const hostname = window.location.hostname;
    if (
      hostname &&
      !["localhost", "127.0.0.1", "vanity-eth.tk"].includes(hostname)
    ) {
      setError("insecure_location");
      toast.error("Insecure location: Untrusted hostname.");
    }
  };

  const setInputValue = (inputType: string, value: any) => {
    setInput((prevInput) => ({ ...prevInput, [inputType]: value }));
  };

  return (
    <div id="app" className="remodal-bg render">
      <ToastContainer />
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
              cores={cores}
              onStart={startGen}
              onStop={stopGen}
              onInputChange={setInputValue}
            />
          </div>
          <div className="col-md-6">
            <Statistics
              prefix={input.prefix}
              suffix={input.suffix}
              checksum={input.checksum}
              status={status}
              firstTick={firstTick}
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
      <Foot />
      <Corner />
    </div>
  );
};

export default Home;
