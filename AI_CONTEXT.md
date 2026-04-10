# AI Context: ForestPlus Frontend V2 (Modern - Ultra-Detailed)

This document is the "Source of Truth" for AI agents and developers working on the `forestPlus-FRONT-v2` repository. It contains the essential knowledge to maintain consistency across the codebase.

## 1. Project Signature & Core Role
- **Core Role**: The modern, high-premium evolutionary frontend for the ForestPlus reforestation platform.
- **Related Repo**: `forestPlus-BACK` (Primary API).
- **Communication Protocol**: HTTP (JSON), uses Bearer JWT for auth.

## 2. Technical Specs
- **Framework**: Angular 19+ (Standalone Components).
- **Build System**: Vite (Fast HMR, modern ES modules).
- **Styling Strategy**: **Vanilla CSS** (NO Tailwind CSS). Flexbox/Grid focused.
- **Icons**: FontAwesome 6 (FA-solid, FA-regular).
- **State**: RxJS (BehaviorSubject) for `currentUser` and `currentLang`.
- **Internationalization**: `@ngx-translate/core` (Spanish as default).

## 3. Directory Structure
```text
src/
├── app/
│   ├── api/          # Auto-generated OpenAPI models & classes
│   ├── dashboard/    # Main app views (Overview, Profile, Admin)
│   ├── services/     # Angular Services (Logic & API wrappers)
│   ├── shared/       # Global UI components (Modals, Banners)
│   ├── app.routes.ts # Main navigation routes
│   └── app.component.ts # Main layout shell
├── assets/           # Images, logos, and global static files
└── styles.css        # Global CSS, Design System, & Variables
```

## 4. DESIGN SYSTEM: "Premium Glassmorphism"
This is the most critical part for AI to follow. We aim for a high-end, vibrant, and alive interface.

### Visual Rules
- **Themes**: Light background with vibrant elements.
- **Glassmorphism**: Use `backdrop-filter: blur(10px)` and transparency for cards (`background: rgba(255, 255, 255, 0.7)`).
- **Color Palette**:
  - `--color-primary`: #69D291 (Emerald green).
  - `--color-secondary`: #E8F5E9 (Soft background green).
  - `--color-text-dark`: #2C3E50 (Deep Slate).
  - Use vibrant gradients for primary actions (Emerald-600 to Green-500).
- **Modern Typography**: Heading (Montserrat), Body (Inter).

### Component Layout (Sidebar & Main)
- **Sidebar**: Fixed/Sticky, collapsible (80px to 280px).
- **Z-Index Strategy**: 
  - Sidebar: 1100.
  - Tooltips: 10000 (Ensure they show OVER the main content).
  - Main Content: 1 (Relative position).
  - Env Banner: 10000+.

## 5. API Integration Patterns
Generated from OpenAPI Tool. Services wrap the generated client calls to provide a clean interface to components.
```typescript
@Injectable({ providedIn: 'root' })
export class TreeService {
  constructor(private treeApi: TreeControllerService) {}
  plantTreeBatch(data: TreeBatchPlantRequestDto): Observable<object> {
    return this.treeApi.plantTreeBatch(data);
  }
}
```

## 6. Project Status (Current Focus)
- **Migrating**: Moving core functionality from V1 (Tailwind) to V2 (Vanilla CSS/Glassmorphism).
- **Refining**: Sidebar is currently the focus (fixing scrolling, tooltip visibility, and administrative layout).
- **Features**: User authentication, Map integration (Leaflet), and Admin CRUDs are high priority.

## 7. AI Guidelines
- **CSS**: NEVER add Tailwind classes. Use the predefined CSS variables in `styles.css`.
- **Aesthetics**: If a UI looks "basic" or "MVP", it failed. Add blurs, subtle shadows, and micro-transitions.
- **Angular**: Use Standalone components. Prefer `RouterLink` and `RouterLinkActive` for navigation.
- **Internationalization**: Use `| translate` pipe in templates. Avoid hardcoded strings in HTML.
- **Tooltips**: Use the `data-tooltip` attribute pattern already established for sidebar items.
