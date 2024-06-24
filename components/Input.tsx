import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

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
  onThreadChange,
}: {
  running: boolean;
  cores: number;
  onStart: () => void;
  onStop: () => void;
  onInputChange: (type: string, value: any) => void;
  onThreadChange: (threads: number) => void;
}) => {
  const [threads, setThreads] = useState(cores || 12);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [checksum, setChecksum] = useState(true);
  const [error, setError] = useState(false);
  const [checkBalance, setCheckBalance] = useState(true);

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
    onThreadChange(threads);
  }, [threads]);

  useEffect(() => {
    onInputChange("checkBalance", checkBalance);
  }, [checkBalance]);
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
    <Box
      component="form"
      onSubmit={(e) => e.preventDefault()}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 3,
      }}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            disabled={running}
            error={prefixError}
            helperText={prefixError && "Numbers and letters from A to F only"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Suffix"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            disabled={running}
            error={suffixError}
            helperText={suffixError && "Numbers and letters from A to F only"}
          />
        </Grid>
      </Grid>
      {running && (
        <Box mt={2} display="flex" justifyContent="center">
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </Box>
      )}
      <Typography variant="body2" color="textSecondary" align="center" mt={2}>
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
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={checksum}
            onChange={(e) => setChecksum(e.target.checked)}
            disabled={running}
          />
        }
        label="Case-sensitive"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={checkBalance}
            onChange={(e) => setCheckBalance(e.target.checked)}
            disabled={running}
          />
        }
        label="check balance"
      />
      <Box display="flex" alignItems="center" mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setThreads(threads - 1)}
          disabled={running || threads <= 1}
        >
          -
        </Button>
        <Typography variant="h6" mx={2}>
          {threads}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setThreads(threads + 1)}
          disabled={running}
        >
          +
        </Button>
        <Typography variant="body2" ml={2}>
          threads {threads === cores && "(recommended)"}
        </Typography>
      </Box>
      <Grid container spacing={2} mt={2} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={running || inputError || error}
          >
            Generate
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={onStop}
            disabled={!running}
          >
            Stop
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserInput;
