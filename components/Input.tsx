type UserInputProps = {
  running: boolean;
  cores: number;
  onStart: () => void;
  onStop: () => void;
  onInputChange: (inputType: string, value: any) => void;
};

const UserInput = ({
  running,
  cores,
  onStart,
  onStop,
  onInputChange,
}: UserInputProps) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Prefix"
        onChange={(e) => onInputChange("prefix", e.target.value)}
        className="text-input-large"
      />
      <input
        type="text"
        placeholder="Suffix"
        onChange={(e) => onInputChange("suffix", e.target.value)}
        className="text-input-large"
      />
      <button onClick={running ? onStop : onStart} className="button-large">
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
};

export default UserInput;
