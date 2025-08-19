# 🏠 Smart Chore Tracker with Points

A modern, gamified chore management application that helps families track household tasks, earn points, and build good habits together.

## 🌐 Live Preview

**Try the app live:** [chore-checklist.vercel.app](https://chore-checklist.vercel.app)

## 🎮 Demo Mode

The app includes a fully functional demo mode that allows you to explore all features without creating an account:

- **Interactive Demo**: Click "Try the demo" on the landing page to enter demo mode
- **Sample Data**: Experience the app with pre-populated chores, users, and progress
- **Full Functionality**: All features work exactly as they would for real users
- **Easy Exit**: Click "Exit Demo" at any time to return to the landing page
- **No Data Persistence**: Demo data is not saved to your device

Perfect for:
- Testing the app before signing up
- Demonstrating features to family members
- Learning how the app works
- Exploring different chore management strategies

## ✨ Features

### 🎯 **Smart Chore Management**
- **Organized by Frequency**: Chores are automatically categorized into Daily, Weekly, Monthly, and Seasonal tasks
- **Difficulty-Based Points**: Easy (5 pts), Medium (10 pts), Hard (15 pts)
- **Priority Levels**: High, Medium, Low priority with visual indicators
- **Due Date Tracking**: Smart due date management with overdue warnings and early completion bonuses

### 🔄 **Reset & Reset Functionality**
- **Reset to Defaults**: One-click reset to reload the complete default chore list with fresh dates
- **Progress Reset**: Clear all completed chores and start fresh
- **Smart Date Management**: Automatically calculates appropriate due dates for recurring tasks

### 📊 **Enhanced Organization**
- **Category Grouping**: View chores organized by frequency or in a flat list
- **Multiple View Modes**: Grid and List views for different preferences
- **Advanced Filtering**: Filter by status, category, priority, and difficulty
- **Smart Sorting**: Sort by priority, difficulty, or due date

### 🎮 **Gamification Features**
- **Point System**: Earn points for completing chores
- **Level Progression**: Level up as you earn more points
- **Early Completion Bonuses**: Get bonus points for completing tasks ahead of schedule
- **Late Completion Penalties**: Reduced points for overdue tasks
- **Achievement Tracking**: Visual feedback for your progress

### 👥 **Family Management**
- **Multi-User Support**: Track chores for multiple family members
- **Leaderboard**: See who's leading the household chores
- **Progress Sharing**: Celebrate achievements together

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd chore-checklist-with-points

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📋 Default Chore List

The application comes with a comprehensive set of pre-configured chores organized by frequency:

### 🌅 Daily Chores
- Make the bed (5 pts)
- Take out trash (5 pts)
- Wash dishes (5 pts)
- Wipe kitchen counters (5 pts)
- Feed pets (5 pts)

### 📅 Weekly Chores
- Vacuum floors (10 pts)
- Change bed sheets (10 pts)
- Clean bathroom (10 pts)
- Do laundry (10 pts)
- Take out recycling (10 pts)

### 🗓️ Monthly Chores
- Deep clean kitchen (15 pts)
- Organize closets (15 pts)
- Clean windows (15 pts)
- Dust ceiling fans (15 pts)
- Clean refrigerator (15 pts)

### 🌸 Seasonal Chores
- Spring cleaning (15 pts)
- Summer yard work (15 pts)
- Fall cleanup (15 pts)
- Winter preparation (15 pts)

## 🎨 Customization

### Adding Custom Chores
- Use the "Add Chore" form to create personalized tasks
- Set custom difficulty, priority, and due dates
- Choose from existing categories or create new ones

### Modifying Default Chores
- Edit the `src/utils/defaultChores.ts` file to customize the default list
- Add new categories or modify existing ones
- Adjust point values and difficulty levels

## 🔧 Technical Details

### Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Storage**: Local Storage with automatic persistence
- **UI Components**: Custom component library with shadcn/ui

### Key Components
- `ChoreList`: Main chore display with filtering and organization
- `ChoreContext`: State management for chores and statistics
- `AddChoreForm`: Form for creating new chores
- `PointsCounter`: Real-time points and level display
- `HouseholdManager`: Family member and settings management

### Data Structure
```typescript
interface Chore {
  id: string
  title: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date
  completed: boolean
  completedAt?: Date
  finalPoints?: number
  bonusMessage?: string
}
```

## 🎯 Usage Tips

### For Parents
- Use the reset functionality to start fresh each week/month
- Customize the default chore list to match your family's needs
- Set appropriate due dates for recurring tasks
- Monitor progress through the dashboard

### For Kids
- Complete chores to earn points and level up
- Try to complete tasks early for bonus points
- Check the leaderboard to see your ranking
- Use the rewards system to redeem points

### For Families
- Set up household members in the Household Manager
- Create a chore rotation schedule
- Celebrate achievements together
- Use the app to build consistent habits

## 🔄 Reset Functionality

### When to Use Reset
- **Weekly Reset**: Start fresh each week with new due dates
- **Monthly Reset**: Clear progress and reload seasonal tasks
- **Seasonal Reset**: Update chores for changing seasons
- **Fresh Start**: Clear all data and begin again

### How Reset Works
1. Click "Reset to Defaults" button
2. Confirm the action in the popup
3. All chores are cleared and replaced with fresh defaults
4. Due dates are recalculated based on current date
5. Progress is reset to start fresh

## 🎨 UI Features

### Visual Indicators
- **Color Coding**: Different colors for difficulty levels and priorities
- **Icons**: Emoji and Lucide icons for better visual recognition
- **Status Badges**: Clear indicators for overdue, due soon, and completed tasks
- **Progress Bars**: Visual progress tracking for categories

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Responsive Grid**: Adapts to different screen sizes
- **Touch Friendly**: Large touch targets for mobile users
- **Accessible**: High contrast and readable text

## 🚀 Future Enhancements

- [ ] Cloud synchronization
- [ ] Push notifications for due dates
- [ ] Photo verification for completed chores
- [ ] Integration with smart home devices
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode theme

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- UI components inspired by shadcn/ui
- Icons from Lucide React
- Styling with Tailwind CSS

---

**Happy Chore Tracking! 🎉**
