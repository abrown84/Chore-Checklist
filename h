[33mcommit 06b74f50d010d7416dad4ba7f0151d5496975a5f[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m)[m
Author: abrown84 <konfliktquake@gmail.com>
Date:   Fri Nov 28 17:32:58 2025 -0800

    feat: admin redemption approval and mobile responsiveness improvements
    
    - Fix admin redemption approval to check household membership role instead of user table role
    - Fix global leaderboard query to properly filter and display all households
    - Improve mobile responsiveness across all components:
      * Leaderboard: responsive grid layout and stacked sidebar on mobile
      * LeaderboardList: mobile-friendly stats display with proper truncation
      * PointRedemption: responsive cards, grids, and form layouts
      * AppLayout/Header: improved spacing and padding for mobile devices
    - Reduce padding and text sizes on smaller screens
    - Add responsive breakpoints for better mobile UX

 convex/cronFunctions.ts                         | 126 [32m+++++++++++++++++[m[31m---[m
 convex/stats.ts                                 | 146 [32m++++++++++++++++++++[m[31m----[m
 convex/users.ts                                 |  20 [32m++[m[31m--[m
 dev-dist/sw.js                                  |   2 [32m+[m[31m-[m
 src/components/AppHeader.tsx                    |   9 [32m+[m[31m-[m
 src/components/AppLayout.tsx                    |   2 [32m+[m[31m-[m
 src/components/ChoreProgress.tsx                |   4 [32m+[m[31m-[m
 src/components/HouseholdManager.tsx             |   3 [32m+[m[31m-[m
 src/components/Leaderboard.tsx                  |  32 [32m+++[m[31m---[m
 src/components/PointRedemption.tsx              | 102 [32m++++++++[m[31m---------[m
 src/components/PointsCounter.tsx                |   4 [32m+[m[31m-[m
 src/components/ProfileAndRewards.tsx            | 120 [32m+++++++++++++++++[m[31m--[m
 src/components/RoleSystemDemo.tsx               |  11 [32m+[m[31m-[m
 src/components/leaderboard/LeaderboardList.tsx  |  74 [32m++++++[m[31m------[m
 src/components/leaderboard/LevelOverview.tsx    |   3 [32m+[m[31m-[m
 src/components/leaderboard/PersonalProgress.tsx |   3 [32m+[m[31m-[m
 src/contexts/ChoreContext.tsx                   |   2 [32m+[m[31m-[m
 src/contexts/RedemptionContext.tsx              |   3 [32m+[m[31m-[m
 src/utils/convexHelpers.ts                      |  16 [32m+++[m
 19 files changed, 499 insertions(+), 183 deletions(-)
