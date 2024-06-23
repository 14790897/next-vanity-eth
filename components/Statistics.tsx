type StatisticsProps = {
  prefix: string;
  suffix: string;
  checksum: boolean;
  status: string;
  firstTick: number | null;
};

const Statistics = ({
  prefix,
  suffix,
  checksum,
  status,
  firstTick,
}: StatisticsProps) => {
  let timeElapsed = null;
  if (firstTick) {
    timeElapsed = (performance.now() - firstTick) / 1000; // 计算持续时间，以秒为单位
  }

  return (
    <div>
      <p>Prefix: {prefix}</p>
      <p>Suffix: {suffix}</p>
      <p>Checksum: {checksum.toString()}</p>
      <p>Status: {status}</p>
      {firstTick && <p>Time Elapsed: {timeElapsed.toFixed(2)} seconds</p>}
    </div>
  );
};

export default Statistics;
