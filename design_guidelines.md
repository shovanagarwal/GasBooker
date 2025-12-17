# Online Gas Booking System - Design Guidelines

## Design Approach

**Hybrid Approach**: Customer portal draws inspiration from Airbnb's approachable card-based design and smooth interactions, while Agency portal follows Material Design principles for data-dense dashboards and enterprise functionality.

## Typography Hierarchy

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN) - clean, modern sans-serif for UI
- Accent: Space Grotesk - for hero headlines and standout numbers

**Scale**:
- Hero Headlines: text-5xl to text-6xl, font-bold
- Section Titles: text-3xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base, font-normal
- Small Text/Labels: text-sm, font-medium
- Dashboard Stats: text-4xl to text-5xl, font-bold (numerical displays)

## Layout System

**Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16, 20, 24 for consistency
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Grid spacing: grid with gap-6

**Container Strategy**:
- Page containers: max-w-7xl mx-auto px-6
- Dashboard grids: max-w-screen-2xl for data displays
- Form containers: max-w-md to max-w-lg centered

## Component Library

### Navigation
- **Header**: Fixed top navigation with logo left, menu center, theme toggle + user avatar right
- Responsive hamburger menu for mobile with slide-in drawer
- Breadcrumb navigation for agency portal sections
- Tabbed navigation for switching between booking/payment/supply pages

### Authentication Overlay
- **Modal Design**: Centered overlay (max-w-md) with backdrop blur
- Role selector at top: Toggle between Customer/Agency with pill-style buttons
- Tabbed interface within modal: Login | Register
- Social login options below form divider
- Form fields with floating labels and inline validation states

### Dashboard Cards

**Customer Dashboard**:
- Hero card: Quick booking widget with cylinder selection dropdown, delivery date picker, prominent CTA
- Status cards grid (2x2): Active Bookings, Pending Deliveries, Payment Due, Loyalty Points
- Recent bookings table with cylinder type, date, status badges, action buttons

**Agency Dashboard**:
- Stats overview: 4-column grid displaying Total Bookings, Pending Supplies, Revenue (with percentage change indicators)
- Chart section: Line chart for booking trends, bar chart for cylinder type distribution
- Supply management table: Sortable columns, status indicators, quick action buttons
- Inventory cards showing cylinder stock levels with progress bars

### Cards & Content Blocks
- Elevated cards with subtle shadows (shadow-md to shadow-lg)
- Rounded corners: rounded-lg to rounded-xl
- Cylinder cards: Image placeholder top, cylinder specs (type, capacity, price), availability badge, "Book Now" button
- Booking cards: Timeline-style layout showing booking → supply → delivery → payment stages with connecting lines

### Forms
- Grouped inputs with labels above
- Input fields: rounded-lg borders, focus states with ring offset
- Select dropdowns with custom styling matching inputs
- Date pickers with calendar overlay
- Payment method selection: Radio cards with icon + label
- Submit buttons: Full-width on mobile, auto-width on desktop

### Data Visualization
- Progress bars for cylinder inventory levels (striped for low stock warning)
- Status badges: Pill-shaped with icons (Pending, Confirmed, Delivered, Paid)
- Charts using Chart.js library: Line charts for trends, donut charts for distribution, bar charts for comparisons
- Statistical cards with large numbers, trend arrows, and mini sparklines

### Modals & Overlays
- Booking confirmation: Modal with order summary, cylinder details, delivery timeline
- Payment modal: Secure payment interface with mode selection (cards, UPI, cash)
- Image lightbox for cylinder product images
- Notification toasts: Top-right corner with auto-dismiss

## Page Layouts

### Landing Page
- **Hero Section**: Full-width banner with background image of gas delivery/cylinders, headline "Book Your Gas Cylinder in 60 Seconds", dual CTA buttons (Customer Login | Agency Login)
- Features grid: 3-column showcase of key benefits with icons
- How It Works: 4-step process with numbered cards
- Cylinder types showcase: Card grid with images and pricing
- Trust indicators: Customer count, delivery speed stats, agency partners

### Customer Portal
- Dashboard: Widget-based layout with quick actions top, bookings table below
- Browse Cylinders: Filter sidebar left, grid of cylinder cards right (3-4 columns)
- Booking Details: Single column detailed view with timeline tracker
- Payment History: Table with search/filter controls

### Agency Portal
- Analytics Dashboard: Multi-chart layout with KPI cards at top
- Supply Management: Master-detail view with list left, details right
- Inventory: Grid of cylinder type cards with stock meters
- Booking Requests: Kanban-style columns (New, Confirmed, In Transit, Delivered)

## Icons & Assets

**Icon Library**: Heroicons (outline for navigation, solid for actions) via CDN

**Image Requirements**:
- **Hero Image**: Wide format (1920x800px) showing professional gas delivery or modern kitchen with gas stove - vibrant, trustworthy feel
- Cylinder product images: Consistent aspect ratio (1:1 or 4:3), white/neutral backgrounds
- Agency dashboard: Abstract data visualization backgrounds for empty states
- Login overlay: Subtle pattern or gradient background

## Responsive Breakpoints

- Mobile: Single column layouts, stacked navigation, full-width cards
- Tablet (md): 2-column grids, horizontal navigation visible
- Desktop (lg): 3-4 column grids, sidebar layouts for dashboards, expanded tables

## Animations (Minimal)

- Page transitions: Subtle fade-in for route changes
- Card hover: Slight elevation increase (shadow transition)
- Modal entrance: Scale from 95% to 100% with fade
- Theme toggle: Smooth color transition (duration-300)
- Chart animations: Animated on scroll into view (once)
- Loading states: Skeleton screens for data-heavy sections

## Theme Specifications

**Structure (applied to both themes)**:
- Use CSS custom properties for theme values
- Toggle switches between light/dark classes on root element
- Persistent storage via localStorage
- Smooth transitions on theme change (all duration-200)

## Accessibility

- ARIA labels on all interactive elements
- Focus indicators: Ring-2 with offset on all inputs/buttons
- Keyboard navigation support for modals and forms
- Alt text for all cylinder images
- Screen reader announcements for booking status changes

This system balances approachable consumer UX with robust enterprise functionality for agencies, creating a professional yet friendly gas booking experience.