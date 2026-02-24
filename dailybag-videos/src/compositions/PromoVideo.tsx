import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
  staticFile,
  Img,
} from "remotion";

export type PromoVideoProps = {
  tagline: string;
  features: string[];
};

export const PromoVideo: React.FC<PromoVideoProps> = ({ tagline, features }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const isVertical = height > width;

  // Logo entrance animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // Tagline fade in
  const taglineOpacity = interpolate(frame, [fps * 1, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [fps * 1, fps * 2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background gradient animation
  const gradientRotation = interpolate(frame, [0, durationInFrames], [0, 360]);

  return (
    <AbsoluteFill className="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
      {/* Animated background circles */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity: 0.3,
        }}
      >
        <div
          className="absolute w-96 h-96 rounded-full bg-accent-500 blur-3xl"
          style={{
            top: "10%",
            left: "-10%",
            transform: `rotate(${gradientRotation}deg) translateX(50px)`,
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full bg-primary-400 blur-3xl"
          style={{
            bottom: "20%",
            right: "-10%",
            transform: `rotate(${-gradientRotation}deg) translateX(30px)`,
          }}
        />
      </div>

      {/* Logo */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          top: isVertical ? "15%" : "10%",
          left: "50%",
          transform: `translateX(-50%) scale(${logoScale})`,
        }}
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 140,
            height: 140,
          }}
        />
        <h1
          className="font-display font-bold text-white mt-6"
          style={{
            fontSize: isVertical ? 72 : 56,
          }}
        >
          Daily Bag
        </h1>
      </div>

      {/* Tagline */}
      <div
        className="absolute w-full text-center px-8"
        style={{
          top: isVertical ? "40%" : "50%",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <p
          className="font-display text-white/90"
          style={{
            fontSize: isVertical ? 42 : 36,
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Features */}
      <div
        className="absolute w-full px-12"
        style={{
          top: isVertical ? "52%" : "65%",
        }}
      >
        <div className={`flex flex-col ${isVertical ? "gap-6" : "gap-4"}`}>
          {features.map((feature, index) => (
            <Sequence from={fps * 2.5 + index * 15} key={feature}>
              <FeatureItem
                feature={feature}
                isVertical={isVertical}
              />
            </Sequence>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <Sequence from={fps * 6}>
        <CallToAction isVertical={isVertical} />
      </Sequence>
    </AbsoluteFill>
  );
};

const FeatureItem: React.FC<{ feature: string; isVertical: boolean }> = ({
  feature,
  isVertical,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  const x = interpolate(entrance, [0, 1], [-50, 0]);

  return (
    <div
      className="flex items-center gap-4"
      style={{
        opacity: entrance,
        transform: `translateX(${x}px)`,
      }}
    >
      <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center">
        <span className="text-white text-xl">✓</span>
      </div>
      <span
        className="font-sans font-semibold text-white"
        style={{
          fontSize: isVertical ? 32 : 28,
        }}
      >
        {feature}
      </span>
    </div>
  );
};

const CallToAction: React.FC<{ isVertical: boolean }> = ({ isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const pulse = Math.sin(frame * 0.1) * 0.03 + 1;

  return (
    <AbsoluteFill
      className="items-center justify-end pb-24"
      style={{
        transform: `scale(${scale * pulse})`,
      }}
    >
      <div
        className="bg-white rounded-full px-12 py-5 shadow-2xl"
        style={{
          marginBottom: isVertical ? 80 : 40,
        }}
      >
        <span
          className="font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
          style={{
            fontSize: isVertical ? 36 : 28,
          }}
        >
          Download Now
        </span>
      </div>
    </AbsoluteFill>
  );
};
