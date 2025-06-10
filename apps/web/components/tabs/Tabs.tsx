import clsx from "clsx";
import React, { ReactElement, useState } from "react";

import TabTitle from "./TabTitle";

interface Props {
  children: ReactElement[];
  defaultTab?: number;
  activeTab?: number;
  setActiveTab?: any;
  fullWidth?: boolean;
  colorScheme?: "primary" | "secondary";
}

function Tabs({
  children,
  defaultTab = 0,
  activeTab = 0,
  setActiveTab = null,
  fullWidth = false,
  colorScheme = "primary",
}: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  return (
    <div>
      <ul
        className={clsx(
          "inline-flex rounded-3  p-1 gap-1",
          fullWidth && "w-full",
          colorScheme === "primary" ? "bg-primary-bg" : "bg-secondary-bg",
        )}
      >
        {children.map((item, index) => (
          <TabTitle
            colorScheme={colorScheme}
            fullWidth={fullWidth}
            key={index}
            selectedTab={activeTab || selectedTab}
            title={item.props.title}
            index={index}
            setSelectedTab={setActiveTab || setSelectedTab}
          />
        ))}
      </ul>
      {children[activeTab || selectedTab]}
    </div>
  );
}

export default Tabs;
