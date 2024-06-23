type ErrProps = {
  error: string;
};

const Err = ({ error }: ErrProps) => {
  return <div className="text-red-500">{error}</div>;
};

export default Err;
