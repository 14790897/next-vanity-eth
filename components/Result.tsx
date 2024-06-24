import { useEffect, useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import blockies from "blockies";
type ResultProps = {
  address: string;
  privateKey: string;
};

const Result = ({ address, privateKey }: ResultProps) => {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setReveal(false);
    const id = document.getElementById("identicon");
   if (id) {
     id.innerHTML = "";
     if (address) {
       const icon = blockies({
         seed: address.toLowerCase(),
         size: 8,
         scale: 6,
       });
       const img = document.createElement("img");
       img.src = icon.toDataURL();
       id.appendChild(img);
     }
   }
  }, [address]);

  const revealKey = () => {
    setReveal(true);
  };

  return (
    <Box className="panel p-4 bg-gray-100 rounded-md shadow-md">
      <Box className="flex items-center mb-4">
        <Box
          id="identicon"
          className="w-12 h-12 mr-4 bg-gray-200"
          component="img"
        />
        <Box>
          <Typography variant="body1">
            Address: <span className="output">{address}</span>
          </Typography>
          <Typography variant="body1">
            Private key:{" "}
            <span className="output" onClick={revealKey}>
              {reveal ? privateKey : "Click to reveal"}
            </span>
          </Typography>
        </Box>
      </Box>
      <Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          className="mt-4"
          disabled={!privateKey}
        >
          <i className="icon-lock mr-2"></i>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default Result;
