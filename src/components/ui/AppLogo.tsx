import Image from "next/image";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 28, className = "" }: AppLogoProps) {
  return (
    <Image
      src="/icon.png"
      alt="ApplyReady"
      width={size}
      height={size}
      className={`rounded-xl ${className}`}
      priority
    />
  );
}
