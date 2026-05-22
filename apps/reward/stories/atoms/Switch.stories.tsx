import Switch from "@repo/ui/switch";
import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    checked: true,
  },
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ checked: !checked });
    }

    return <Switch {...args} handleChange={onChange} checked={checked} />;
  },
};
