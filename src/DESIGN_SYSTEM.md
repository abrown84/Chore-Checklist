# Design System - Daily Bag

This document outlines the unified design system used throughout Daily Bag app, ensuring consistency from the landing page to the main application.

## 🎨 Color Palette

### Primary Colors
- **Primary**: `hsl(217 91% 58%)` - Vibrant blue for main actions
- **Primary Foreground**: `hsl(0 0% 100%)` - White text on primary backgrounds

### Secondary Colors
- **Secondary**: `hsl(220 20% 14%)` - Subtle backgrounds and borders
- **Secondary Foreground**: `hsl(210 18% 88%)` - Text on secondary backgrounds

### Accent Colors
- **Accent**: `hsl(220 22% 16%)` - Hover states and subtle highlights
- **Accent Foreground**: `hsl(210 20% 90%)` - Text on accent backgrounds

### Status Colors
- **Success**: `hsl(142 70% 45%)` - Green for positive actions
- **Warning**: `hsl(47 90% 55%)` - Yellow for caution
- **Destructive**: `hsl(0 70% 52%)` - Red for dangerous actions
- **Info**: `hsl(217 91% 58%)` - Blue for information

### Neutral Colors
- **Background**: `hsl(220 27% 8%)` - Main app background
- **Card**: `hsl(220 25% 11%)` - Card backgrounds
- **Border**: `hsl(220 16% 16%)` - Subtle borders
- **Muted**: `hsl(220 18% 13%)` - Disabled/inactive elements
- **Muted Foreground**: `hsl(220 12% 60%)` - Secondary text

## 🎭 Background Patterns

### Gradient Background
All pages use a consistent radial gradient background:
```css
bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)]
```

### Card Backgrounds
- **Default**: `bg-card/40 backdrop-blur-sm` - Semi-transparent with backdrop blur
- **Elevated**: `bg-card/60 backdrop-blur-md` - More opaque for important content
- **Subtle**: `bg-card/20 backdrop-blur-sm` - Very transparent for secondary content

## 🧩 Component System

### PageWrapper
The main layout wrapper that provides:
- Consistent background gradients
- Page headers with titles and descriptions
- Fade-in animations
- Proper spacing and layout

```tsx
<PageWrapper 
  title="Page Title" 
  description="Page description"
  showBackground={true}
>
  {/* Page content */}
</PageWrapper>
```

### ConsistentCard
Unified card component with variants:
- **Default**: Standard card with subtle border and shadow
- **Elevated**: More prominent shadow for important content
- **Subtle**: Minimal styling for secondary content

```tsx
<ConsistentCard variant="elevated" padding="lg" hover={true}>
  <ConsistentCardHeader>Header</ConsistentCardHeader>
  <ConsistentCardContent>Content</ConsistentCardContent>
  <ConsistentCardFooter>Footer</ConsistentCardFooter>
</ConsistentCard>
```

### ConsistentButton
Unified button system with consistent styling:
- **Primary**: Amber background (`bg-amber-400`) for main actions
- **Secondary**: Subtle background for secondary actions
- **Outline**: Bordered style for tertiary actions
- **Ghost**: Minimal styling for subtle interactions
- **Destructive**: Red background for dangerous actions

```tsx
<PrimaryButton size="lg" loading={isLoading}>
  Submit
</PrimaryButton>
```

### ConsistentInput
Form inputs with consistent styling:
- Built-in error states
- Icon support (left/right positioning)
- Consistent focus states
- Proper spacing and typography

```tsx
<EmailInput
  value={email}
  onChange={setEmail}
  label="Email Address"
  error={emailError}
  icon={<Mail className="h-4 w-4" />}
  required
/>
```

### ConsistentBadge
Status indicators with semantic colors:
- **Success**: Green for positive states
- **Warning**: Yellow for caution
- **Error**: Red for problems
- **Info**: Blue for information

```tsx
<SuccessBadge size="md">Completed</SuccessBadge>
<WarningBadge size="sm">Pending</WarningBadge>
```

## 📱 Layout Patterns

### Header
- **Sticky positioning** with backdrop blur
- **Consistent logo treatment** with rounded background
- **Responsive navigation** that adapts to screen size
- **Theme toggle** and user actions

### Sidebar
- **Fixed width** (`w-64 xl:w-72`) for consistency
- **Semi-transparent background** with backdrop blur
- **Active state indicators** with primary color accents
- **Consistent spacing** and typography

### Content Areas
- **Responsive padding** (`p-4 sm:p-6 lg:p-8`)
- **Grid layouts** for feature sections
- **Consistent spacing** between elements
- **Proper hierarchy** with headings and descriptions

## 🎬 Animation System

### Fade Animations
- **Fade Up**: Elements slide up while fading in
- **Fade In**: Simple opacity transitions
- **Staggered**: Multiple elements animate in sequence

### Hover Effects
- **Subtle shadows** that increase on hover
- **Background opacity** changes
- **Smooth transitions** (200ms duration)

### Loading States
- **Spinner animations** for async operations
- **Skeleton loading** for content
- **Progressive disclosure** for complex forms

## 📏 Spacing Scale

### Consistent Spacing
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)

### Component Spacing
- **Card padding**: `p-4 sm:p-6` (responsive)
- **Section margins**: `mb-6 sm:mb-8` (responsive)
- **Element gaps**: `space-y-4` (consistent)

## 🔤 Typography

### Font Families
- **Heading**: `font-heading` - Bold, prominent text
- **Body**: `font-body` - Regular, readable text
- **Brand**: `font-brand` - Logo and brand elements

### Font Sizes
- **xs**: `0.75rem` (12px) - Small labels
- **sm**: `0.875rem` (14px) - Body text
- **base**: `1rem` (16px) - Default text
- **lg**: `1.125rem` (18px) - Large text
- **xl**: `1.25rem` (20px) - Headings
- **2xl**: `1.5rem` (24px) - Section titles
- **3xl**: `1.875rem` (30px) - Page titles

## 🎯 Usage Guidelines

### Do's
- ✅ Use `PageWrapper` for all new pages
- ✅ Use `ConsistentCard` for content containers
- ✅ Use `ConsistentButton` for all interactive elements
- ✅ Use `ConsistentInput` for form fields
- ✅ Use `ConsistentBadge` for status indicators
- ✅ Follow the spacing scale consistently
- ✅ Use semantic color variants

### Don'ts
- ❌ Don't create custom background patterns
- ❌ Don't use hardcoded colors
- ❌ Don't skip the component system
- ❌ Don't use inconsistent spacing
- ❌ Don't mix different design patterns

## 🔧 Implementation

### Importing Components
```tsx
import { PageWrapper } from '../components/PageWrapper'
import { ConsistentCard, ConsistentCardHeader, ConsistentCardContent } from '../components/ui/consistent-card'
import { PrimaryButton, OutlineButton } from '../components/ui/consistent-button'
import { EmailInput, PasswordInput } from '../components/ui/consistent-input'
import { SuccessBadge, WarningBadge } from '../components/ui/consistent-badge'
```

### Creating New Pages
```tsx
export default function NewPage() {
  return (
    <PageWrapper 
      title="Page Title" 
      description="Page description"
    >
      <ConsistentCard>
        <ConsistentCardHeader>
          <h2>Section Title</h2>
        </ConsistentCardHeader>
        <ConsistentCardContent>
          <p>Content goes here</p>
          <PrimaryButton>Action</PrimaryButton>
        </ConsistentCardContent>
      </ConsistentCard>
    </PageWrapper>
  )
}
```

This design system ensures that Daily Bag maintains a cohesive, professional appearance across all pages and components while providing a delightful user experience.
