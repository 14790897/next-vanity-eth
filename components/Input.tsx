import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const isValidHex = (hex: string) => {
  return hex.length ? /^[0-9A-F]+$/i.test(hex) : true;
};

const mixCase = (str: string) => {
  return str
    .split("")
    .map((char) =>
      Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase()
    )
    .join("");
};

const UserInput = ({
  running,
  cores,
  onStart,
  onStop,
  onInputChange,
}: {
  running: boolean;
  cores: number;
  onStart: () => void;
  onStop: () => void;
  onInputChange: (type: string, value: any) => void;
}) => {
  const [threads, setThreads] = useState(cores || 4);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [checksum, setChecksum] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    onInputChange("prefix", prefix);
  }, [prefix]);

  useEffect(() => {
    onInputChange("suffix", suffix);
  }, [suffix]);

  useEffect(() => {
    onInputChange("checksum", checksum);
  }, [checksum]);

  useEffect(() => {
    onInputChange("threads", threads);
  }, [threads]);

  const prefixError = !isValidHex(prefix);
  const suffixError = !isValidHex(suffix);
  const inputError = prefixError || suffixError;

  useEffect(() => {
    if (inputError) {
      toast.error("Numbers and letters from A to F only");
    }
  }, [inputError]);

  const example = !inputError
    ? {
        prefix: checksum ? prefix : mixCase(prefix),
        suffix: checksum ? suffix : mixCase(suffix),
        random: Array.from({ length: 40 - prefix.length - suffix.length }, () =>
          mixCase(Math.floor(Math.random() * 16).toString(16))
        ).join(""),
      }
    : null;

  const handleStart = () => {
    if (!running && !inputError && !error) {
      onStart();
    }
  };

  return (
    <div className="panel" id="input-panel">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleStart();
        }}
      >
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 lg:w-1/2 px-2 mb-4 sm:mb-0">
            <input
              className={`text-input-large w-full ${
                prefixError ? "border-red-500" : ""
              }`}
              type="text"
              placeholder="Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              disabled={running}
            />
          </div>
          <div className="w-full sm:w-1/2 lg:w-1/2 px-2">
            <input
              className={`text-input-large w-full ${
                suffixError ? "border-red-500" : ""
              }`}
              type="text"
              placeholder="Suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              disabled={running}
            />
          </div>
        </div>

        <div className={`flex justify-center ${running ? "hidden" : "block"}`}>
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div className="example text-sm text-gray-500">
          E.g.&nbsp;
          {inputError ? (
            <span className="monospace">N/A</span>
          ) : (
            <span className="monospace">
              0x<b>{example?.prefix}</b>
              {example?.random}
              <b>{example?.suffix}</b>
            </span>
          )}
        </div>

        <div className="controls my-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={checksum}
              onChange={(e) => setChecksum(e.target.checked)}
              disabled={running}
            />
            <span className="ml-2">Case-sensitive</span>
          </label>
        </div>

        <div className="threads flex items-center my-3">
          <button
            type="button"
            className="square-btn px-3 py-1 bg-gray-300 text-gray-700"
            onClick={() => setThreads(threads - 1)}
            disabled={running || threads <= 1}
          >
            -
          </button>
          <h4 className="mx-3">{threads}</h4>
          <button
            type="button"
            className="square-btn px-3 py-1 bg-gray-300 text-gray-700"
            onClick={() => setThreads(threads + 1)}
            disabled={running}
          >
            +
          </button>
          <span>&nbsp;threads</span>
          {threads === cores && (
            <span className="ml-2 text-sm text-gray-500">(recommended)</span>
          )}
        </div>

        <div className="flex flex-wrap">
          <div className="w-full lg:w-1/2 px-2 mb-4 lg:mb-0">
            <button
              type="button"
              className="button-large w-full bg-blue-500 text-white py-2"
              onClick={handleStart}
              disabled={running || inputError || error}
            >
              Generate
            </button>
          </div>
          <div className="w-full lg:w-1/2 px-2">
            <button
              type="button"
              className="button-large w-full bg-red-500 text-white py-2"
              onClick={onStop}
              disabled={!running}
            >
              Stop
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserInput;
