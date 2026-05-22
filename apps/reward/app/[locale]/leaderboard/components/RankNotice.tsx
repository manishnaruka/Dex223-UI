import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  isConnected: boolean;
  hasRank: boolean;
}

export default function RankNotice({ isConnected, hasRank }: Props) {
  if (hasRank) {
    return (
      <div className="flex min-w-0 flex-col gap-3 rounded-3 border-l-2 border-green bg-tertiary-bg/50 p-3 text-12 text-secondary-text sm:flex-row sm:items-center sm:justify-between md:p-4 md:text-14">
        <span className="min-w-0">Your rank: #128</span>
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.SMALL}
          mobileSize={ButtonSize.SMALL}
          className="w-full sm:w-auto"
        >
          View my rank
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-3 border-l-2 border-green bg-tertiary-bg/50 p-3 text-12 text-secondary-text sm:flex-row sm:items-center sm:justify-between md:p-4 md:text-14">
      <span className="min-w-0">
        {isConnected
          ? "You don’t have a rank yet. Start trading to earn your place on the leaderboard"
          : "Connect your wallet to view your rank"}
      </span>
      <Button
        variant={ButtonVariant.CONTAINED}
        colorScheme={ButtonColor.LIGHT_GREEN}
        size={ButtonSize.SMALL}
        mobileSize={ButtonSize.SMALL}
        className="w-full sm:w-auto"
      >
        {isConnected ? "Trade to earn" : "Connect wallet"}
      </Button>
    </div>
  );
}
