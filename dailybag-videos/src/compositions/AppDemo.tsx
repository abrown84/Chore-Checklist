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
import { Video } from "@remotion/media";

export type AppDemoProps = {
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  features?: string[];
  ctaText?: string;
};

export const AppDemo: React.FC<AppDemoProps> = ({
  videoSrc = "overview-video.mp4",
  title = "Daily Bag",
  subtitle = "Make chores fun again",
  features = [
    "Track daily tasks with ease",
    "Earn points for every chore",
    "Level up and unlock rewards",
    "Compete with family & friends",
  ],
  ctaText = "Download Free",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Video fade in
  const videoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Video scale for Ken Burns effect
  const videoScale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill className="bg-black">
      {/* Background video */}
      <div
        style={{
          opacity: videoOpacity,
          transform: `scale(${videoScale})`,
          width: "100%",
          height: "100%",
        }}
      >
        <Video
          src={staticFile(videoSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          volume={0}
        />
        {/* Darkening overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"
        />
      </div>

      {/* Intro sequence */}
      <Sequence from={0} durationInFrames={fps * 3} premountFor={fps}>
        <IntroTitle title={title} subtitle={subtitle} />
      </Sequence>

      {/* Feature callouts */}
      {features.map((feature, index) => (
        <Sequence
          key={feature}
          from={fps * 3 + index * fps * 2}
          durationInFrames={fps * 2.5}
          premountFor={fps * 0.5}
        >
          <FeatureCallout feature={feature} index={index} />
        </Sequence>
      ))}

      {/* CTA at the end */}
      <Sequence
        from={fps * 3 + features.length * fps * 2}
        durationInFrames={fps * 4}
        premountFor={fps}
      >
        <CallToAction text={ctaText} title={title} />
      </Sequence>

      {/* Persistent branding */}
      <TopBranding title={title} />
    </AbsoluteFill>
  );
};

const IntroTitle: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntrance = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  const subtitleEntrance = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 20 },
  });

  const exit = interpolate(frame, [fps * 2.5, fps * 3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center"
      style={{ opacity: exit }}
    >
      <div
        className="text-center"
        style={{
          transform: `translateY(${interpolate(titleEntrance, [0, 1], [50, 0])}px)`,
          opacity: titleEntrance,
        }}
      >
        <h1 className="font-display font-bold text-white text-8xl drop-shadow-2xl">
          {title}
        </h1>
      </div>
      <div
        className="mt-6"
        style={{
          transform: `translateY(${interpolate(subtitleEntrance, [0, 1], [30, 0])}px)`,
          opacity: subtitleEntrance,
        }}
      >
        <p className="font-sans text-white/90 text-4xl">
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};

const FeatureCallout: React.FC<{ feature: string; index: number }> = ({
  feature,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const exit = interpolate(
    frame,
    [fps * 1.8, fps * 2.2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Alternate left/right positioning
  const isLeft = index % 2 === 0;
  const xOffset = interpolate(entrance, [0, 1], [isLeft ? -100 : 100, 0]);

  return (
    <AbsoluteFill
      className={`flex items-center ${isLeft ? "justify-start pl-16" : "justify-end pr-16"}`}
      style={{
        opacity: entrance * exit,
        paddingTop: height * 0.35,
      }}
    >
      <div
        className="flex items-center gap-6"
        style={{
          transform: `translateX(${xOffset}px)`,
        }}
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl">
          <span className="text-4xl">
            {["✓", "⭐", "🚀", "🏆"][index % 4]}
          </span>
        </div>
        {/* Text */}
        <div
          className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-5"
          style={{ maxWidth: 500 }}
        >
          <p className="font-sans font-semibold text-white text-3xl">
            {feature}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CallToAction: React.FC<{ text: string; title: string }> = ({
  text,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const pulse = 1 + Math.sin(frame * 0.15) * 0.02;

  const logoEntrance = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-black/50">
      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoEntrance})`,
          opacity: logoEntrance,
        }}
        className="mb-8"
      >
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 160,
            height: 160,
          }}
        />
      </div>

      {/* App name */}
      <h2
        className="font-display font-bold text-white text-6xl mb-4"
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
        }}
      >
        {title}
      </h2>

      {/* CTA Button */}
      <div
        className="mt-8"
        style={{
          opacity: entrance,
          transform: `scale(${entrance * pulse})`,
        }}
      >
        <div className="bg-gradient-to-r from-primary-500 to-accent-600 rounded-full px-16 py-6 shadow-2xl">
          <span className="font-display font-bold text-white text-4xl">
            {text}
          </span>
        </div>
      </div>

      {/* App Store badges hint */}
      <p
        className="mt-8 font-sans text-white/60 text-2xl"
        style={{
          opacity: interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Available on iOS & Android
      </p>
    </AbsoluteFill>
  );
};

const TopBranding: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in after intro, fade out before CTA
  const opacity = interpolate(
    frame,
    [fps * 3, fps * 3.5, durationInFrames - fps * 4, durationInFrames - fps * 3.5],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      className="absolute top-8 left-8 flex items-center gap-4"
      style={{ opacity }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 48,
          height: 48,
        }}
      />
      <span className="font-display font-bold text-white text-2xl drop-shadow-lg">
        {title}
      </span>
    </div>
  );
};
