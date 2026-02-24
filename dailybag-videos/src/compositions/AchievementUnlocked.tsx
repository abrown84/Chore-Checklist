import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

export type AchievementUnlockedProps = {
  achievementName: string;
  description: string;
  icon: "trophy" | "star" | "medal" | "crown" | "fire";
};

const iconMap: Record<AchievementUnlockedProps["icon"], string> = {
  trophy: "🏆",
  star: "⭐",
  medal: "🏅",
  crown: "👑",
  fire: "🔥",
};

export const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({
  achievementName,
  description,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge pop-in animation
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Text animations
  const titleOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [fps * 0.5, fps * 1], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const descOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shimmer effect
  const shimmerX = interpolate(frame, [fps * 1.5, fps * 2.5], [-200, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ring pulse
  const ringScale = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 15 },
  });

  const ringOpacity = interpolate(ringScale, [0, 0.5, 1], [0, 0.5, 0]);

  return (
    <AbsoluteFill className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-96 h-96 rounded-full bg-purple-500 blur-3xl"
          style={{
            opacity: 0.3 + Math.sin(frame * 0.1) * 0.1,
          }}
        />
      </div>

      {/* Expanding ring */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: ringOpacity,
        }}
      >
        <div
          className="w-64 h-64 rounded-full border-4 border-yellow-400"
          style={{
            transform: `scale(${ringScale * 2})`,
          }}
        />
      </div>

      {/* Main content */}
      <AbsoluteFill className="flex flex-col items-center justify-center">
        {/* Achievement badge */}
        <div
          className="relative"
          style={{
            transform: `scale(${badgeScale})`,
          }}
        >
          {/* Outer glow */}
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50" />

          {/* Badge container */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl">
            {/* Inner circle */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center border-4 border-yellow-200">
              <span style={{ fontSize: 72 }}>{iconMap[icon]}</span>
            </div>

            {/* Shimmer effect */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ opacity: 0.4 }}
            >
              <div
                className="absolute w-24 h-full bg-white blur-lg"
                style={{
                  left: shimmerX,
                  transform: "skewX(-20deg)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Achievement unlocked label */}
        <div
          className="mt-12 text-center"
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <p className="font-display text-yellow-400 text-2xl tracking-widest mb-2">
            ACHIEVEMENT UNLOCKED
          </p>
          <h2 className="font-display font-bold text-white text-5xl">
            {achievementName}
          </h2>
        </div>

        {/* Description */}
        <p
          className="mt-6 font-sans text-white/70 text-2xl text-center px-16"
          style={{ opacity: descOpacity }}
        >
          {description}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
