export interface GuideStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  instructions: string;
  imageUrl?: string;
  clickHighlight?: string;
}

export interface GuideConfig {
  title: string;
  description: string;
  protection: {
    disableCopy: boolean;
    disableRightClick: boolean;
    watermark: boolean;
  };
  steps: GuideStep[];
}

export const DEFAULT_GUIDE_CONFIG: GuideConfig = {
  title: "Complete PC Setup Walkthrough",
  description: "Follow the visual, click-by-click instructions below to configure and play your titles on your system.",
  protection: {
    disableCopy: true,
    disableRightClick: true,
    watermark: true,
  },
  steps: [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Client & Environment Preparation",
      subtitle: "Initial Setup",
      instructions: "Ensure your desktop client is installed and up to date on your Windows PC. Close any background game sessions before proceeding.",
      imageUrl: "",
      clickHighlight: "Ensure client is running with standard user permissions.",
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "Library Configuration & Folder Setup",
      subtitle: "Folder Linking",
      instructions: "Open your local games directory and verify your storage drive has sufficient space for your single-player installs.",
      imageUrl: "",
      clickHighlight: "Verify drive space and local storage path.",
    },
    {
      id: "step-3",
      stepNumber: 3,
      title: "Offline Mode Verification",
      subtitle: "Final Step",
      instructions: "Switch client to Offline Mode to preserve your local saves and play single-player campaigns without session interruptions.",
      imageUrl: "",
      clickHighlight: "Confirm Offline Mode status in the top client menu.",
    },
  ],
};
