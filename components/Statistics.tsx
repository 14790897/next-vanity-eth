import { useEffect, useState } from "react";
import humanizeDuration from "humanize-duration";
import { Box, Typography, LinearProgress } from "@mui/material";

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

const computeProbability = (difficulty: number, attempts: number) => {
  //这个是几何分布中至少成功一次的概率计算方法
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
  attempts,
}: {
  prefix: string;
  suffix: string;
  checksum: boolean;
  status: string;
  firstTick: number | null;
  attempts: number;
}) => {
  const [count, setCount] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (attempts > 0) {
      setCount(attempts);
      setSpeed(() =>
        attempts > 0
          ? Math.floor(
              (1000 * attempts) /
                (performance.now() - (firstTick || performance.now()))
            )
          : 0
      );
    } else {
      setCount(0);
      setSpeed(0);
    }
  }, [attempts, firstTick]);

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
    <Box
      className="panel"
      p={4}
      bgcolor="grey.100"
      borderRadius={2}
      boxShadow={2}
      justifyContent="center"
    >
      <Typography variant="body1">
        Difficulty:{" "}
        <span className="output">{formatNum(Number(difficulty))}</span>
      </Typography>
      <Typography variant="body1">
        Generated:{" "}
        <span className="output">
          {formatNum(count)}
          {count === 1 ? " address" : " addresses"}
        </span>
      </Typography>
      <Typography variant="body1">
        50% probability:{" "}
        <span className="output">{speed ? time50 : addresses50}</span>
      </Typography>
      <Typography variant="body1">
        Speed: <span className="output">{speed} addr/s</span>
      </Typography>
      <Typography variant="body1">
        Status: <span className="output">{status}</span>
      </Typography>

      <Box mt={4}>
        <LinearProgress variant="determinate" value={probability} />
      </Box>
      <Box textAlign="center" mt={2}>
        <Typography variant="h4">{probability}%</Typography>
        <Typography variant="body2">Probability</Typography>
      </Box>
    </Box>
  );
};

export default Statistics;
