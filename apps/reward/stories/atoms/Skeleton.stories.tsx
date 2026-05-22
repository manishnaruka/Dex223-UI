import Skeleton from "@repo/ui/skeleton";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: "w-12 h-4",
  },
};

export const Circle: Story = {
  args: {
    className: "w-10 h-10",
    shape: "circle",
  },
};
