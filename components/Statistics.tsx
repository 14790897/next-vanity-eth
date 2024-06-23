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
  return (
    <div>
      <p>Prefix: {prefix}</p>
      <p>Suffix: {suffix}</p>
      <p>Checksum: {checksum.toString()}</p>
      <p>Status: {status}</p>
      {firstTick && <p>First Tick: {firstTick}</p>}
    </div>
  );
};

export default Statistics;
