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
  videoUrl?: string;
  videoTitle?: string;
  protection: {
    disableCopy: boolean;
    disableRightClick: boolean;
    watermark: boolean;
    antiScreenshot: boolean;
  };
  steps: GuideStep[];
}

export const DEFAULT_GUIDE_CONFIG: GuideConfig = {
  title: "Complete PC Setup Walkthrough",
  description: "Follow the visual, click-by-click instructions below to configure and play your titles on your system.",
  videoUrl: "https://drive.google.com/file/d/1uW1L51h0L0Nc6JFUuL1wBX2D_RsW_3-0/view?usp=drivesdk",
  videoTitle: "Complete Step-by-Step Video Walkthrough",
  protection: {
    disableCopy: true,
    disableRightClick: true,
    watermark: true,
    antiScreenshot: true,
  },
  steps: [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Accessing the Setup Portal & Desktop App Link",
      subtitle: "Initial Setup",
      instructions: 'go to lua.tools > then  click on "lua desktop app is here " displayes at center of screen',
      imageUrl: "/guide/guide_1793990598176_Screenshot_2026-11-06_232502.png",
      clickHighlight: 'click on "lua desktop app is here " in purple at top',
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "Downloading & Running the Desktop Installer",
      subtitle: "Folder Linking",
      instructions: "click download button of installer says Download {11.4 mb} and install and if windows installer says dont run , no need to worry click on run anyway and it will install and allow for permissions if it asks any .",
      imageUrl: "/guide/guide_1793991048507_Screenshot_2026-11-06_232757.png",
      clickHighlight: "click download button of installer says Download {11.4 mb}",
    },
    {
      id: "step-3",
      stepNumber: 3,
      title: "Windows Security Configuration",
      subtitle: "Final Step",
      instructions: "Go to seetings then in it go to windows  security > then go to threat and protection and click on manage settings > then turn off real time protection",
      imageUrl: "/guide/guide_1793991098007_Screenshot_2026-11-06_233332.png",
      clickHighlight: "Go to seetings then in it go to windows  security > then go to threat and protection and click on manage settings > then turn off real time protection",
    },
    {
      id: "step-1793991101992",
      stepNumber: 4,
      title: "Initial Launch & Profile Configuration",
      subtitle: "Configuration",
      instructions: "once the lua app opens click on use recommended settings/profile and Log in the lua with discord",
      imageUrl: "",
      clickHighlight: "click on use recommended settings/profile",
    },
    {
      id: "step-1793991210746",
      stepNumber: 5,
      title: "Active Mode & Tool Verification",
      subtitle: "Configuration",
      instructions: "you are all set with the setup and go to mode in lua as mentioned and ensure that BetterSteamTools is installed if not then click on install. This will automatically open the  Steam app installed in your pc , if not open it by yourself",
      imageUrl: "/guide/guide_1793991268736_Screenshot_2026-11-06_234050.png",
      clickHighlight: "",
    },
    {
      id: "step-1793991273043",
      stepNumber: 6,
      title: "Title Discovery & Library Search",
      subtitle: "Configuration",
      instructions: "all done , now go to  + Add , and in search bar type the name of game you want to install",
      imageUrl: "",
      clickHighlight: "",
    },
    {
      id: "step-1793991276000",
      stepNumber: 7,
      title: "Download & Local Cache Verification",
      subtitle: "Verification",
      instructions: "Wait for the download to initiate in Steam client. Once verified, configure offline mode as described.",
      imageUrl: "",
      clickHighlight: "",
    },
    {
      id: "step-1793991278000",
      stepNumber: 8,
      title: "Switch to Offline Mode & Enjoy Uninterrupted Play",
      subtitle: "Finalizing",
      instructions: "In Steam menu click Go Offline. Verify game launches and local save works. You are completely ready!",
      imageUrl: "",
      clickHighlight: "",
    },
  ],
};
