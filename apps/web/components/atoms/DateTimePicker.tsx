import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextField from "@/components/atoms/TextField";

export default function DateTimePicker() {
  return (
    <>
      <TextField label="Deadline" internalText={<Svg iconName="date" />} />
      <div className="relative">
        <Input
          step={1}
          className="h-12 text-16 rounded-2 md:rounded-3 appearence-none duration-200 focus:outline-0 pl-4 md:pl-5 placeholder:text-tertiary-text w-full bg-secondary-bg border text-primary-text"
          type="datetime-local"
          onChange={(e) => {
            console.log(e.target.value);
            console.log(typeof e.target.value);
          }}
        />
        <Svg
          iconName="date"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary-text"
        />
      </div>
    </>
  );
}
