import { useEffect, useState } from "react";
import humanizeDuration from "humanize-duration";

const isValidHex = (hex: string) => {
  return hex.length ? /^[0-9A-F]+$/i.test(hex) : true;
};

const computeDifficulty = (
  prefix: string,
  suffix: string,
  isChecksum: boolean
) => {
  const pattern = prefix + suffix;
  const ret = Math.pow(16, pattern.length);
  return isChecksum
    ? ret * Math.pow(2, pattern.replace(/[^a-f]/gi, "").length)
    : ret;
};

const computeProbability = (difficulty: number, attempts: number) => { //这个是几何分布中至少成功一次的概率计算方法
  return 1 - Math.pow(1 - 1 / difficulty, attempts);
};

const formatNum = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const Statistics = ({
  prefix,
  suffix,
  checksum,
  status,
  firstTick,
}: {
  prefix: string;
  suffix: string;
  checksum: boolean;
  status: string;
  firstTick: number | null;
}) => {
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const handleIncrement = (incr: number) => {
      setCount((prevCount) => (incr > 0 ? prevCount + incr : 0));
      setSpeed((prevSpeed) =>
        incr > 0
          ? Math.floor(
              (1000 * (count + incr)) /
                (performance.now() - (firstTick || performance.now()))
            )
          : 0
      );
    };

    window.addEventListener("increment-counter", (e: any) =>
      handleIncrement(e.detail)
    );
    return () => {
      window.removeEventListener("increment-counter", (e: any) =>
        handleIncrement(e.detail)
      );
    };
  }, [count, firstTick]);

  const inputError = !isValidHex(prefix) || !isValidHex(suffix);
  const difficulty = inputError
    ? "N/A"
    : computeDifficulty(prefix, suffix, checksum);
  const probability50 = inputError
    ? 0
    : Math.floor(Math.log(0.5) / Math.log(1 - 1 / difficulty));
  const addresses50 =
    probability50 === -Infinity //这个是几何分布的概率分布函数
      ? "Nearly impossible"
      : inputError
      ? "N/A"
      : `${formatNum(probability50)} addresses`;
  const time50 =
    probability50 / speed > 200 * 365.25 * 24 * 3600 ||
    probability50 / speed === -Infinity
      ? "Thousands of years"
      : inputError
      ? "N/A"
      : humanizeDuration(Math.round(probability50 / speed) * 1000, {
          largest: 2,
        });
  const probability =
    Math.round(10000 * computeProbability(difficulty, count)) / 100;

  return (
    <div className="panel p-4 bg-gray-100 rounded-md shadow-md">
      <div>
        Difficulty:{" "}
        <span className="output">{formatNum(Number(difficulty))}</span>
      </div>
      <div>
        Generated:{" "}
        <span className="output">
          {formatNum(count)}
          {count === 1 ? " address" : " addresses"}
        </span>
      </div>
      <div>
        50% probability:{" "}
        <span className="output">{speed ? time50 : addresses50}</span>
      </div>
      <div>
        Speed: <span className="output">{speed} addr/s</span>
      </div>
      <div>
        Status: <span className="output">{status}</span>
      </div>

      <div className="probability mt-4 bg-gray-200 h-4 relative">
        <div
          className="probability-bar bg-blue-500 h-full"
          style={{ width: `${probability}%` }}
        ></div>
      </div>
      <div className="percentage text-center mt-2">
        <h4>{probability}%</h4>
        <div>Probability</div>
      </div>
    </div>
  );
};

export default Statistics;
