import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import Select from "@/components/atoms/Select";

const meta = {
  title: "Atoms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

export const Success: Story = {
  args: {
    options: [
      {
        label: "Banana",
        value: "banana",
      },
      { label: "Lemon", value: "lemon" },
      { label: "Orange", value: "orange" },
      { label: "Apple", value: "apple" },
      { label: "Peach", value: "peach" },
    ],
  },
  render: function Render(args) {
    const [{ value, extendWidth }, updateArgs] = useArgs();

    function onChange(_value: string) {
      updateArgs({ value: _value });
    }

    return (
      <div className="w-[400px]">
        <Select
          optionsHeight={174}
          options={[
            {
              label: "Banana",
              value: "banana",
            },
            { label: "Lemon", value: "lemon" },
            { label: "Orange", value: "orange" },
            { label: "Apple", value: "apple" },
            { label: "Peach", value: "peach" },
            { label: "Grape", value: "grape" },
            { label: "Pineapple", value: "Pineapple" },
            { label: "Blackberry", value: "Blackberry" },
            { label: "Blueberry", value: "Blueberry" },
            { label: "Peach", value: "peach" },
          ]}
          onChange={onChange}
          value={value}
          extendWidth={extendWidth}
        />
      </div>
    );
  },
};
