import clsx from "clsx";
import React, { ReactElement, useState } from "react";

import TabTitle from "./TabTitle";

interface Props {
  children: ReactElement[];
  defaultTab?: number;
  activeTab?: number;
  setActiveTab?: any;
  fullWidth?: boolean;
}

function Tabs({
  children,
  defaultTab = 0,
  activeTab = 0,
  setActiveTab = null,
  fullWidth = false,
}: Props) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || 0);

  console.log(fullWidth);
  return (
    <div>
      <ul
        className={clsx(
          "rounded-3 bg-primary-bg p-1 gap-1",
          fullWidth
            ? "w-full grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] grid"
            : "inline-flex",
        )}
      >
        {children.map((item, index) => (
          <TabTitle
            fullWidth
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
