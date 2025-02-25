import Preloader from "@repo/ui/preloader";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Atoms/Preloader",
  component: Preloader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Preloader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
  args: {
    size: 24,
    type: "linear",
  },
};
