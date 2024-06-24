"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Headline from "@/components/Headline";
import Err from "@/components/Error";
import UserInput from "@/components/Input";
import Statistics from "@/components/Statistics";
import Result from "@/components/Result";
import Foot from "@/components/Footer";
const MAX_BALANCE_MESSAGES = 10;

const Home = () => {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Waiting");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [threads, setThreads] = useState(12);
  const [cores, setCores] = useState(0);
  const [result, setResult] = useState({ address: "", privateKey: "" });
  const [input, setInput] = useState({
    prefix: "",
    suffix: "",
    checksum: true,
    checkBalance: true,
  });
  const [firstTick, setFirstTick] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [balances, setBalances] = useState<string[]>([]);
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
    if (data.type === "balanceFound") {
      setResult({ address: data.address, privateKey: data.privKey });
      setStatus("balance found");
      stopGen();
      toast.success("balance found!");
    } else if (data.type === "balance") {
      console.log(data.message);
      setBalances((prevBalances) => {
        const newBalances = [...prevBalances, data.message];
        if (newBalances.length > MAX_BALANCE_MESSAGES) {
          newBalances.shift(); // 删除最早的消息
        }
        return newBalances;
      });
    } else if (data.type === "addressFound") {
      stopGen();
      displayResult(data);
      toast.success("Address found!");
    } else if (data.type === "error") {
      stopGen();
      setError(data.message);
      setStatus("Error");
      toast.error(data.message);
    }
    if (data.attempts) {
      setAttempts((prevAttempts) => prevAttempts + data.attempts);
    }
  };

  const startGen = () => {
    if (typeof window !== "undefined" && window.Worker) {
      clearResult();
      setRunning(true);
      setStatus("Running");
      setFirstTick(performance.now());
      toast.info("Generation started...");

      // Initialize workers afresh
      const newWorkers = [];
      for (let w = 0; w < threads; w++) {
        try {
          const worker = new Worker(
            new URL("../js/vanity.js", import.meta.url)
          );
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

      newWorkers.forEach((worker) => {
        worker.postMessage({ ...input });
      });
      console.log("input", input);
      console.log("threads", threads);
    } else {
      setError("workers_unsupported");
      toast.error("Web Workers are not supported in your environment.");
    }
  };

  const stopGen = async () => {
    setRunning(false);
    setStatus("Stopped");
    console.log("workers:", workers.length);
    workers.forEach((worker) => worker.terminate());
    setWorkers([]);
    toast.info("Generation stopped.");
  };

  const clearResult = () => {
    setResult({ address: "", privateKey: "" });
    setAttempts(0);
  };

  const displayResult = (result: any) => {
    setResult({ address: result.address, privateKey: result.privKey });
    setStatus("Address found");
  };

  const initWorkers = () => {
    if (workers.length === threads) return;

    // Terminate extra workers if thread count is reduced
    if (workers.length > threads) {
      workers.slice(threads).forEach((worker) => worker.terminate());
      setWorkers(workers.slice(0, threads));
      return;
    }

    // Create new workers if thread count is increased
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
      const coreCount = navigator.hardwareConcurrency || 12;
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
    <div id="app" className="flex items-center justify-center min-h-screen">
      <ToastContainer />
      <div className="container mx-auto px-4">
        <div className="row">
          <div className="col-md-12">
            <Headline />
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
              onThreadChange={setThreads}
            />
          </div>
          <div className="col-md-6">
            <Statistics
              prefix={input.prefix}
              suffix={input.suffix}
              checksum={input.checksum}
              status={status}
              firstTick={firstTick}
              attempts={attempts}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Result
              address={result.address}
              privateKey={result.privateKey}
              balances={balances}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Foot />
          </div>
        </div>
      </div>
      {/* <Foot />  */}
      {/* <Corner /> */}
    </div>
  );
};

export default Home;
