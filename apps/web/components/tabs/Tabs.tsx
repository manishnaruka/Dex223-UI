import clsx from "clsx";
import React, { ReactElement, ReactNode, useState } from "react";

import TabTitle from "./TabTitle";

interface Props {
  children: ReactElement[];
  defaultTab?: number;
  activeTab?: number;
  setActiveTab?: any;
  fullWidth?: boolean;
  colorScheme?: "primary" | "secondary";
  rightContent?: ReactNode;
}

function Tabs({
  children,
  defaultTab = 0,
  activeTab = 0,
  setActiveTab = null,
  fullWidth = false,
  colorScheme = "primary",
  rightContent,
}: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  return (
    <div>
      <div className="flex items-center justify-between">
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
        {rightContent}
      </div>

      {children[activeTab || selectedTab]}
    </div>
  );
}

export default Tabs;
