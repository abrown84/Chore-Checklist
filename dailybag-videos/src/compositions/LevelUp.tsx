import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

export type LevelUpProps = {
  previousLevel: number;
  newLevel: number;
  userName: string;
  levelTitle: string;
};

export const LevelUp: React.FC<LevelUpProps> = ({
  previousLevel,
  newLevel,
  userName,
  levelTitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Flash effect at start
  const flashOpacity = interpolate(frame, [0, fps * 0.3], [1, 0], {
    extrapolateRight: "clamp",
  });

  // Main content entrance
  const contentEntrance = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 12 },
  });

  // Level number counter animation
  const levelProgress = interpolate(
    frame,
    [fps * 0.5, fps * 1.5],
    [previousLevel, newLevel],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Star burst rotation
  const burstRotation = interpolate(frame, [0, durationInFrames], [0, 180]);

  // Celebration particles
  const particleOpacity = interpolate(
    frame,
    [fps * 1, fps * 1.5, durationInFrames - fps],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500">
      {/* Star burst background */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: 0.2,
          transform: `rotate(${burstRotation}deg) scale(${1 + contentEntrance * 0.5})`,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-4 bg-white"
            style={{
              height: 400,
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>

      {/* Celebration particles */}
      <div
        className="absolute inset-0"
        style={{ opacity: particleOpacity }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Flash overlay */}
      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: flashOpacity }}
      />

      {/* Main content */}
      <AbsoluteFill
        className="flex flex-col items-center justify-center"
        style={{
          transform: `scale(${contentEntrance})`,
        }}
      >
        {/* Level up text */}
        <div className="text-center">
          <p className="font-display font-bold text-white/80 text-4xl mb-2 tracking-widest">
            LEVEL UP!
          </p>
          <div className="relative">
            <span
              className="font-display font-extrabold text-white drop-shadow-2xl"
              style={{ fontSize: 180 }}
            >
              {Math.round(levelProgress)}
            </span>
          </div>
          <p className="font-display font-bold text-white text-5xl mt-4">
            {levelTitle}
          </p>
          <p className="font-sans text-white/80 text-3xl mt-4">
            Congratulations, {userName}!
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Particle: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const angle = (index / 20) * Math.PI * 2;
  const speed = 2 + (index % 5);
  const size = 10 + (index % 3) * 8;
  const delay = (index % 10) * 3;

  const distance = interpolate(
    frame - delay,
    [fps * 1, durationInFrames],
    [0, 400],
    { extrapolateLeft: "clamp" }
  );

  const x = Math.cos(angle) * distance + 540;
  const y = Math.sin(angle) * distance + 540;

  const rotation = frame * speed;

  const colors = [
    "bg-yellow-300",
    "bg-orange-400",
    "bg-red-400",
    "bg-pink-400",
    "bg-purple-400",
  ];

  return (
    <div
      className={`absolute rounded-sm ${colors[index % colors.length]}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    />
  );
};
