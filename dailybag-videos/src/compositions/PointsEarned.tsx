import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

export type PointsEarnedProps = {
  points: number;
  choreName: string;
  streak?: number;
};

export const PointsEarned: React.FC<PointsEarnedProps> = ({
  points,
  choreName,
  streak = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Coin pop animation
  const coinEntrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  // Points counter animation
  const displayedPoints = Math.round(
    interpolate(frame, [fps * 0.3, fps * 1.2], [0, points], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Text fade in
  const textOpacity = interpolate(frame, [fps * 0.5, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Streak badge entrance
  const streakEntrance = spring({
    frame: frame - fps * 1.2,
    fps,
    config: { damping: 12 },
  });

  // Coin rotation
  const coinRotateY = interpolate(frame, [0, fps * 0.5], [0, 720], {
    extrapolateRight: "clamp",
  });

  // Floating coins background
  const floatingCoins = Array.from({ length: 8 }).map((_, i) => ({
    x: 100 + i * 120,
    delay: i * 5,
    speed: 1 + (i % 3) * 0.5,
  }));

  return (
    <AbsoluteFill className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
      {/* Floating background coins */}
      {floatingCoins.map((coin, i) => (
        <FloatingCoin key={i} {...coin} />
      ))}

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-80 h-80 rounded-full bg-yellow-400 blur-3xl"
          style={{
            opacity: 0.2 + coinEntrance * 0.1,
          }}
        />
      </div>

      {/* Main content */}
      <AbsoluteFill className="flex flex-col items-center justify-center">
        {/* Coin icon */}
        <div
          style={{
            transform: `scale(${coinEntrance}) perspective(500px) rotateY(${coinRotateY}deg)`,
          }}
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-yellow-200">
            <span className="text-7xl">💰</span>
          </div>
        </div>

        {/* Points earned */}
        <div
          className="mt-8 text-center"
          style={{ opacity: textOpacity }}
        >
          <p className="font-display text-white/80 text-2xl tracking-wide">
            POINTS EARNED
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-display font-extrabold text-white text-8xl">
              +{displayedPoints}
            </span>
          </div>
        </div>

        {/* Chore name */}
        <p
          className="mt-6 font-sans text-white/90 text-3xl"
          style={{ opacity: textOpacity }}
        >
          {choreName}
        </p>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="mt-8 flex items-center gap-3 bg-orange-500/80 rounded-full px-6 py-3"
            style={{
              transform: `scale(${streakEntrance})`,
              opacity: streakEntrance,
            }}
          >
            <span className="text-3xl">🔥</span>
            <span className="font-display font-bold text-white text-2xl">
              {streak} Day Streak!
            </span>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FloatingCoin: React.FC<{
  x: number;
  delay: number;
  speed: number;
}> = ({ x, delay, speed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const y = interpolate(
    (frame + delay) % durationInFrames,
    [0, durationInFrames],
    [1100, -100]
  );

  const rotation = frame * speed * 3;
  const scale = 0.3 + (x % 100) / 200;

  return (
    <div
      className="absolute text-5xl"
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        opacity: 0.4,
      }}
    >
      🪙
    </div>
  );
};
