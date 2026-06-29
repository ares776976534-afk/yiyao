import React from "react";
import SelectProduct from "./SelectProduct";
import SelectSeller from "./SelectSeller";
import Material from "@/pages/studio-home/components/material-content";
import Inquiry from "./Inquiry";
import CommonChat from "./CommonChat";

export enum AgentType {
  SELECT_PRODUCT = "selectProduct",
  SELECT_SELLER = "selectSeller",
  MATERIAL = "material",
  INQUIRY = "inquiry",
  COMMON_CHAT = "commonChat",
}

export default ({
  type,
  ...props
}: {
  type: AgentType;
  [key: string]: any;
}) => {
  const component = {
    [AgentType.SELECT_PRODUCT]: <SelectProduct {...props} />,
    [AgentType.SELECT_SELLER]: <SelectSeller {...props} />,
    [AgentType.MATERIAL]: (
      <Material
        {...props}
        showPromptList={false}
        logMaps={{
          send: "/alphashop.agent-home-page.chatbox.designclick",
          enhanced: "/alphashop.agent-home-page.chatbox.designenhanced",
          uploadimg: "/alphashop.agent-home-page.chatbox.designimg",
          uploaditemurl: "/alphashop.agent-home-page.chatbox.designurl",
        }}
      />
    ),
    [AgentType.INQUIRY]: <Inquiry {...props} />,
    [AgentType.COMMON_CHAT]: <CommonChat {...props} />,
  };

  return component[type as AgentType] || null;
};
