type SaveProps = {
  address: string;
  privateKey: string;
};

const Save = ({ address, privateKey }: SaveProps) => {
  return (
    <div>
      <p>Save your address and private key securely.</p>
      <p>Address: {address}</p>
      <p>Private Key: {privateKey}</p>
    </div>
  );
};

export default Save;
