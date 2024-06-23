type ResultProps = {
  address: string;
  privateKey: string;
};

const Result = ({ address, privateKey }: ResultProps) => {
  return (
    <div>
      <p>Address: {address}</p>
      <p>Private Key: {privateKey}</p>
    </div>
  );
};

export default Result;
