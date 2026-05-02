# IoT StreamGuard - Premium Dashboard

A high-end SaaS IoT dashboard built with Next.js 16, React, and Tailwind CSS featuring real-time monitoring, predictive maintenance, AI insights, and cybersecurity monitoring.

## Architecture Overview

### Design System
- **Color Palette**: Soft blue + white with light gradients
- **Effects**: Glassmorphism with soft shadows (backdrop-blur-sm)
- **Border Radius**: 16-24px rounded cards
- **Layout**: 80/20 split for most pages, single column for detail pages
- **Typography**: Geist font family (sans + mono)

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Charts**: Recharts (dummy data)
- **Icons**: Lucide React
- **Navigation**: Next.js Link + usePathname

## Pages & Routes

### 1. Landing Dashboard (`/`)
- **Layout**: 80/20 split (left content, right machine list)
- **Components**:
  - Hero section with engineer illustration (pop-out effect)
  - 4 feature cards (Real-time Monitoring, Predictive Maintenance, AI Insights, Cybersecurity)
  - Compact calendar widget (today highlighted)
  - Right panel: Machine list with status badges
- **Status**: Non-scrollable, viewport-fit

### 2. Machines Overview (`/machines`)
- **Layout**: 80/20 split
- **Left Section (70%)**: 4 equal square cards showing CNC, Pump, Compressor, Robotic Arm
  - Each card displays: Icon, Status, Risk Score, RUL, Efficiency
  - Cards are clickable (navigate to machine dashboard)
- **Bottom (30%)**: Dummy line chart - Efficiency comparison
- **Right Panel (20%)**: 
  - Status summary (Healthy/Warning/Critical counts)
  - Dummy donut/pie chart showing distribution
- **Status**: Non-scrollable

### 3. Machine Dashboard (`/machine/[id]/dashboard`)
- **Layout**: Single column (scrollable)
- **Sections**:
  - Header with machine info, status, and machine dropdown
  - Prediction summary cards (Status, Risk Score, Confidence, RUL)
  - Failure risk trend chart (dummy data)
  - 4 sensor data graphs (Temperature, Vibration, RPM, Pressure) - all dummy
  - AI analysis section (Root Cause + Recommendations)
- **Status**: **SCROLLABLE** (only exception)
- **Navigation**: Dashboard/AI Insights tabs

### 4. Machine AI Insights (`/machine/[id]/ai-insights`)
- **Layout**: Single column (non-scrollable)
- **Content**:
  - Insight cards (varies by machine status: critical/warning/healthy)
  - Icons: AlertCircle, TrendingDown, Zap
  - Detailed AI analysis paragraph
  - Color-coded severity badges
- **Status**: Non-scrollable
- **Navigation**: Shared tab with Dashboard

### 5. Energy Analytics (`/energy`)
- **Layout**: Single column (non-scrollable)
- **Sections**:
  - 3 summary cards (Total Energy, Avg per Machine, Cost Projection)
  - Dummy line chart - Energy consumption trend (24h)
  - Dummy bar chart - Energy per machine + cost
  - Machine details table (Energy, Cost, Efficiency)
- **Status**: Non-scrollable

### 6. Maintenance (`/maintenance`)
- **Layout**: 80/20 split
- **Left Section (70%)**:
  - Header with technician illustration (pop-out effect)
  - Machine action list (color-coded by status)
  - Root cause + urgency + date selector
  - Maintenance logs (scrollable within section)
- **Right Panel (20%)**: Maintenance schedule list
- **Status**: Non-scrollable

### 7. Cybersecurity (`/cybersecurity`)
- **Layout**: Single column (non-scrollable)
- **Sections**:
  - 3 status cards (Secure, Suspicious, Threat percentages)
  - Donut chart - Status distribution
  - Bar chart - Network activity + threats
  - Threat detection cards (recent threats with severity)
  - XAI explanation section
  - AI Security Agent status (active indicator)
- **Status**: Non-scrollable

## Component Library

### Reusable Components

#### `Layout80-20`
```tsx
<Layout8020 left={content} right={sidebar} rightWidth="20%" />
```
- Flexible 80/20 layout with optional width customization

#### `StatusBadge`
```tsx
<StatusBadge status="healthy" | "warning" | "critical" text="Optional" />
```
- Color-coded status indicator with dot indicator

#### `Navigation`
- Fixed top navigation with active route highlighting
- Routes: Dashboard, Machines, Energy, Maintenance, Security

### Data Types (`lib/types.ts`)
```tsx
type MachineType = 'CNC Machine' | 'Pump' | 'Compressor' | 'Robotic Arm'
type MachineStatus = 'healthy' | 'warning' | 'critical'

interface Machine {
  id: string
  name: MachineType
  status: MachineStatus
  riskScore: number
  rul: number
  efficiency: number
  // ... sensor data
}
```

## Design Features

### Glassmorphism
- `.glass-card`: Rounded cards with backdrop blur and semi-transparent white background
- Used throughout for premium feel

### Animations
- `.floating-card`: Hover animations (shadow + translate)
- `.animate-slide-in`: Entry animations for cards
- `.animate-fade-in`: Fade transitions

### Responsive Design
- Mobile-first approach
- Grid layouts with responsive columns
- Tailwind responsive prefixes (md:, lg:, etc.)

### Color Tokens
- Soft blue primary: `oklch(0.45 0.15 240)`
- Light backgrounds with subtle gradients
- Status colors: green (healthy), amber (warning), red (critical)
- Chart colors with good contrast

## Machine Types (Strict)
Only 4 machine types allowed:
1. **CNC Machine** - Icon: Cpu
2. **Pump** - Icon: Zap
3. **Compressor** - Icon: AlertTriangle
4. **Robotic Arm** - Icon: Shield

## Dummy Data

### Machines (lib/types.ts)
- 4 machines with varied statuses
- Risk scores: 12%, 48%, 18%, 82%
- RUL values: 1240h, 320h, 980h, 48h
- Efficiency: 94%, 78%, 91%, 62%
- Sensor readings (temperature, vibration, rpm, pressure)

### Charts
- All charts use Recharts with animated transitions
- Line charts for trends (temperature, vibration, RPM, pressure, energy, risk)
- Bar charts for comparisons (efficiency, energy, threats)
- Pie/Donut charts for distributions (status, security)
- Data generated dynamically with Math.sin() and Math.random()

## Navigation Flow

```
Landing (/) 
├── Machines (/machines)
│   └── Machine Detail (/machine/[id])
│       ├── Dashboard (/machine/[id]/dashboard) [SCROLLABLE]
│       └── AI Insights (/machine/[id]/ai-insights)
├── Energy (/energy)
├── Maintenance (/maintenance)
└── Security (/cybersecurity)
```

## Installation & Setup

1. Install dependencies: `pnpm install`
2. Run dev server: `pnpm dev`
3. Open http://localhost:3000

## File Structure

```
app/
├── layout.tsx (with Navigation)
├── globals.css (design tokens + animations)
├── page.tsx (Landing Dashboard)
├── machines/
│   └── page.tsx
├── machine/[id]/
│   ├── layout.tsx (Dashboard/AI Insights tabs)
│   ├── dashboard/
│   │   └── page.tsx
│   └── ai-insights/
│       └── page.tsx
├── energy/
│   └── page.tsx
├── maintenance/
│   └── page.tsx
└── cybersecurity/
    └── page.tsx

components/
├── Layout80-20.tsx
├── StatusBadge.tsx
└── Navigation.tsx

lib/
└── types.ts
```

## Key Constraints Met

✅ 7 pages total
✅ Only 4 machine types (CNC, Pump, Compressor, Robotic Arm)
✅ Non-scrollable pages (except Machine Dashboard)
✅ 80/20 layout on main pages
✅ Soft blue + white palette
✅ Glassmorphism effects
✅ 16-24px rounded cards
✅ Engineer illustration with pop-out effect
✅ Technician illustration with pop-out effect
✅ All charts are dummy data (Recharts)
✅ Fixed navigation bar
✅ No "Hello Operator" anywhere
✅ Premium SaaS look and feel
✅ Semantic HTML with proper ARIA attributes
✅ Mobile-first responsive design

## Future Enhancements

- Real API integration for machine data
- WebSocket connections for real-time updates
- User authentication & authorization
- Export data as PDF/CSV
- Custom alerts and notifications
- Dark mode toggle
- Accessibility improvements (WCAG AA)
