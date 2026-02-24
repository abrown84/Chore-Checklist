import { Composition, Folder } from "remotion";
import { PromoVideo, PromoVideoProps } from "./compositions/PromoVideo";
import { LevelUp, LevelUpProps } from "./compositions/LevelUp";
import { AchievementUnlocked, AchievementUnlockedProps } from "./compositions/AchievementUnlocked";
import { PointsEarned, PointsEarnedProps } from "./compositions/PointsEarned";
import { AppDemo, AppDemoProps } from "./compositions/AppDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition
          id="PromoVideo"
          component={PromoVideo}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            tagline: "Make chores fun again",
            features: ["Track tasks", "Earn points", "Level up", "Compete"],
          } satisfies PromoVideoProps}
        />
        <Composition
          id="PromoVideoSquare"
          component={PromoVideo}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            tagline: "Make chores fun again",
            features: ["Track tasks", "Earn points", "Level up", "Compete"],
          } satisfies PromoVideoProps}
        />
        <Composition
          id="AppDemo"
          component={AppDemo}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "overview-video.mp4",
            title: "Daily Bag",
            subtitle: "Make chores fun again",
            features: [
              "Track daily tasks with ease",
              "Earn points for every chore",
              "Level up and unlock rewards",
              "Compete with family & friends",
            ],
            ctaText: "Download Free",
          } satisfies AppDemoProps}
        />
        <Composition
          id="AppDemoSquare"
          component={AppDemo}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            videoSrc: "overview-video.mp4",
            title: "Daily Bag",
            subtitle: "Make chores fun again",
            features: [
              "Track daily tasks with ease",
              "Earn points for every chore",
              "Level up and unlock rewards",
              "Compete with family & friends",
            ],
            ctaText: "Download Free",
          } satisfies AppDemoProps}
        />
      </Folder>

      <Folder name="Celebrations">
        <Composition
          id="LevelUp"
          component={LevelUp}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            previousLevel: 4,
            newLevel: 5,
            userName: "Alex",
            levelTitle: "Habit Hero",
          } satisfies LevelUpProps}
        />
        <Composition
          id="AchievementUnlocked"
          component={AchievementUnlocked}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            achievementName: "Week Warrior",
            description: "Complete chores every day for a week",
            icon: "trophy",
          } satisfies AchievementUnlockedProps}
        />
        <Composition
          id="PointsEarned"
          component={PointsEarned}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            points: 150,
            choreName: "Clean Kitchen",
            streak: 5,
          } satisfies PointsEarnedProps}
        />
      </Folder>
    </>
  );
};
