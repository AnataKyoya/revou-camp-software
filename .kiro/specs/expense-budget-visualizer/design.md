# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer (branded **Spendly**) is a fully client-side single-page application (SPA) built with plain HTML5, CSS3, and Vanilla JavaScript. It allows users to record expenses, set per-category budgets, visualize spending via canvas-rendered charts, and filter/summarize their data — all without a backend, build tools, npm, or external libraries.

All state is persisted in the browser's `localStorage`. The entire application lives in three files:

- `index.html` — structure and markup
- `css/style.css` — all styling (no CSS framework)
- `js/script.js` — all application logic (no JS libraries)

Google Fonts (Inter) is loaded via `<link>` in the `<head>`.

The UI follows a **SaaS dashboard** visual design with a fixed dark sidebar, a sticky topbar, and a four-row main content area:

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (220px, fixed, dark #0f172a)                            │
│  Logo / nav links / Clear All Data (footer)                     │
├─────────────────────────────────────────────────────────────────┤
│ TOPBAR (56px, sticky, white)  "Dashboard"  [● Live]             │
├─────────────────────────────────────────────────────────────────┤
│ ROW 1  [KPI] [KPI] [KPI] [KPI]   — 4-column grid, full width   │
├─────────────────────────────────────────────────────────────────┤
│ ROW 2  [Add Expense]  [Set Budget]  — flex row, equal height    │
├─────────────────────────────────────────────────────────────────┤
│ ROW 3  [Bar Chart]  [Pie Chart]  — flex row, full width         │
├─────────────────────────────────────────────────────────────────┤
│ ROW 4  [Filter + Transactions]  │  [Budget Summary]             │
│        (dashboard-col-main)     │  (dashboard-col-side 420px)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

The application follows a simple **Model → View → Controller** pattern implemented entirely in `script.js`, without any framework.

```
┌──────────────────────────────────────────────────────────────────┐
│                          index.html                               │
│  ┌─────────┐  ┌──────────────────────────────────────────────┐   │
│  │ Sidebar │  │ Main Content                                  │   │
│  │  (nav)  │  │  ┌──────────────────────────────────────┐    │   │
│  │         │  │  │ Topbar (h1 + Live badge)              │    │   │
│  │         │  │  ├──────────────────────────────────────┤    │   │
│  │         │  │  │ ROW 1: KPI Cards (×4)                │    │   │
│  │         │  │  ├──────────────────────────────────────┤    │   │
│  │         │  │  │ ROW 2: Add Expense | Set Budget       │    │   │
│  │         │  │  ├──────────────────────────────────────┤    │   │
│  │         │  │  │ ROW 3: Bar Chart | Pie Chart          │    │   │
│  │         │  │  ├──────────────────────────────────────┤    │   │
│  │         │  │  │ ROW 4: Filter+Transactions | Summary  │    │   │
│  │         │  │  └──────────────────────────────────────┘    │   │
│  └─────────┘  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
         │                │
         ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      script.js                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  State (in-memory mirror of localStorage)        │   │
│  │  { expenses: [...], budgets: {...}, filters:{} } │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  StorageModule  (read/write localStorage)        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ValidationModule  (form input checks)           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  FilterModule  (date range + category filter)    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RenderModule  (DOM updates: KPIs, list,         │   │
│  │                summary, validation, banner)      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ChartModule  (canvas bar chart + pie chart)     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                     localStorage                         │
│  "ebv_expenses"  →  JSON array of Expense objects        │
│  "ebv_budgets"   →  JSON object { category: amount }     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. On page load, the Storage Module reads `localStorage` and populates the in-memory state.
2. User actions (add, delete, set budget, filter, clear) mutate the in-memory state and immediately persist it via the Storage Module.
3. After every state mutation, `RenderModule.refresh()` re-renders the KPI stat cards, expense list, summary panel, and both charts using the current (possibly filtered) state.

### Key Design Decisions

- **Single source of truth**: The in-memory `state` object is always a mirror of `localStorage`. All reads go through state; all writes go through the Storage Module which updates both.
- **Full re-render on change**: Rather than fine-grained DOM patching, every state change triggers a full re-render of affected sections. Given the scale of this app, this is simpler and fast enough.
- **No IDs from the server**: Expenses are assigned an `id` using `Date.now() + Math.random()` at creation time, which is sufficient for a client-only app.
- **Canvas charts drawn from scratch**: On every relevant state change, the canvas context is cleared and charts are redrawn. This avoids stale state in chart objects.
- **No external dependencies**: No npm, no build tools, no charting libraries. Charts are drawn entirely with the HTML Canvas 2D API.

---

## Semantic HTML Structure

The page uses semantic HTML5 elements throughout:

- `<aside class="sidebar">` — fixed dark sidebar with logo, nav, and footer
- `<main class="main-content">` — offset by sidebar width, contains topbar and page body
- `<header class="topbar">` — sticky topbar with `<h1>` title and Live badge
- `<nav class="sidebar-nav">` with `<ul role="list">` — sidebar navigation
- `<section aria-labelledby>` wrapping `<article class="card">` — each dashboard panel
- `<figure>` + `<figcaption class="sr-only">` — wraps each canvas chart
- `<h1>` in topbar; `<h2>` for card titles and chart titles; `<h2 class="sr-only">` for KPI section and charts-row headings
- `<footer class="sidebar-footer">` — sidebar footer containing the Clear All Data button
- All decorative SVGs: `aria-hidden="true" focusable="false"`
- Error spans: `role="alert" aria-live="polite"` + `aria-describedby` on inputs
- `#expense-list`: `aria-live="polite" aria-relevant="additions removals"`
- `#summary`: `aria-live="polite" aria-relevant="all"`
- `#expense-count-badge`: `aria-live="polite" aria-atomic="true"`
- `#warning-banner`: `role="alert" aria-live="polite"`
- Filter controls wrapper: `role="search" aria-label="Filter expenses"`

---

## Components and Interfaces

All components are plain JavaScript functions/objects within `script.js`. Logical grouping is via object literals.

### 1. State Object

```js
const state = {
  expenses: [],   // Array<Expense>
  budgets: {},    // { [category: string]: number }
  filters: {
    startDate: null,   // string | null  (YYYY-MM-DD)
    endDate: null,     // string | null
    category: null,    // string | null
  },
};
```

### 2. Storage Module

```js
const StorageModule = {
  save()   // → void  — serializes state.expenses + state.budgets to localStorage
  load()   // → void  — reads localStorage, populates state; falls back to empty state + warning banner on error
  clear()  // → void  — removes both keys from localStorage, resets state.expenses and state.budgets
}
```

- Keys: `"ebv_expenses"` and `"ebv_budgets"`
- On `SecurityError` (storage blocked) or `SyntaxError` (corrupted JSON), initializes with empty arrays/objects and calls `RenderModule.showWarningBanner()`.

### 3. Validation Module

```js
const ValidationModule = {
  validateExpense(formData)  // → { valid: boolean, errors: { [field: string]: string } }
  validateBudget(formData)   // → { valid: boolean, errors: { [field: string]: string } }
}
```

- Expense rules: `amount > 0`, `category` not empty, `date` not empty. `description` is optional.
- Budget rules: `amount > 0`, `category` not empty.
- Returns an errors map keyed by field name so the Render Module can display inline messages.

### 4. Filter Module

```js
const FilterModule = {
  apply(expenses, filters)  // → Array<Expense>  — returns filtered subset without mutating input
  clear()                   // → void  — resets state.filters to all-null
}
```

- Filtering is non-destructive: the original `state.expenses` array is never modified.
- `apply()` chains: date-range filter → category filter.
- ISO date strings (`YYYY-MM-DD`) compare correctly lexicographically.

### 5. Render Module

```js
const RenderModule = {
  _formatCurrency(amount)                        // → string  — formats as USD, e.g. "$42.50"
  renderExpenseList(expenses)                    // → void  — updates #expense-list DOM
  renderSummary(expenses, budgets)               // → void  — updates #summary DOM
  renderValidationErrors(errors, formId)         // → void  — shows inline errors
  clearValidationErrors(formId)                  // → void  — clears all .error-msg spans in form
  showWarningBanner(message)                     // → void  — makes #warning-banner visible
  renderStatCards(expenses, budgets)             // → void  — updates 4 KPI stat card values
  refresh()                                      // → void  — calls all render functions with current filtered state
}
```

- `refresh()` is the single entry point called after every state mutation.
- It computes the filtered expense list once and passes it to all sub-renderers and the Chart Module.
- `renderStatCards()` updates: `#stat-total` (total spending), `#stat-count` (transaction count sub-label), `#stat-budgets` (number of budgets set), `#stat-over` (over-budget category count). Note: `#stat-categories` is present in the HTML but is not currently updated by `renderStatCards`.

### 6. Chart Module

```js
const ChartModule = {
  _PALETTE: string[]                                          // 10-color fixed palette
  _colorFor(index)                                            // → string  — cycles through _PALETTE
  _aggregateByCategory(expenses)                              // → { [category]: number }
  drawBarChart(canvas, expenses, budgets)                     // → void
  drawPieChart(canvas, expenses)                              // → void
}
```

- Both draw functions accept a `<canvas>` element and data; they clear and redraw from scratch.
- Bar chart (`id="bar-chart"`, `width=520`, `height=240`): one bar per spending category; a dashed red horizontal reference line per category with a budget set; y-axis gridlines and labels; x-axis category labels (truncated at 10 chars).
- Pie chart (`id="pie-chart"`, `width=520`, `height=240`): one arc per category with non-zero spending, proportional to total; a legend below the pie showing color swatch + category name.
- Palette: `['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']` (indigo, amber, emerald, blue, pink, violet, teal, orange, cyan, lime).
- Both render "No data" centered text when the expenses array is empty.

### 7. Event Handlers (wired in `init()`)

```js
handleExpenseFormSubmit(event)   // add-expense form submit
handleExpenseListClick(event)    // delegated click on #expense-list (delete button)
handleBudgetFormSubmit(event)    // set-budget form submit
handleFilterChange()             // change on any filter field
handleClearFilters()             // click on #clear-filters-btn
handleClearAll()                 // click on #clear-all-btn (with window.confirm)

function init()  // → void  — populates selects, attaches listeners, loads storage, renders
```

`init()` is wired to `DOMContentLoaded`.

---

## Data Models

### Expense

```js
{
  id: string,           // unique identifier: `${Date.now()}-${Math.random()}`
  amount: number,       // positive float, e.g. 42.50
  category: string,     // one of the CATEGORIES values
  description: string,  // free text, may be empty string
  date: string          // ISO date string "YYYY-MM-DD"
}
```

### Budget

Budgets are stored as a plain object (not an array) keyed by category name:

```js
{
  "Food": 300,
  "Transport": 100,
  "Entertainment": 50
}
```

This makes lookups O(1) and overwrites natural (no need to search for existing entry).

### Filter State

```js
{
  startDate: string | null,   // "YYYY-MM-DD" or null
  endDate: string | null,     // "YYYY-MM-DD" or null
  category: string | null     // category name or null
}
```

### localStorage Schema

| Key | Value |
|---|---|
| `"ebv_expenses"` | `JSON.stringify(Array<Expense>)` |
| `"ebv_budgets"` | `JSON.stringify({ [category]: number })` |

### Predefined Categories

The category dropdowns are populated from a fixed constant defined in `script.js`:

```js
const CATEGORIES = [
  'Food', 'Transport', 'Entertainment',
  'Health', 'Housing', 'Shopping', 'Other'
];
```

This list populates the expense form select, the budget form select, and the filter category select.

---

## CSS Architecture

All styles live in `css/style.css`. No CSS framework is used.

### Design Tokens (CSS Custom Properties)

```css
--brand, --brand-dark, --brand-light, --brand-mid
--gray-0 through --gray-900
--green, --green-bg, --green-dark
--red, --red-bg, --red-dark
--blue, --blue-bg, --blue-dark
--amber, --amber-bg
--sidebar-w: 220px
--topbar-h: 56px
--r-sm, --r-md, --r-lg          /* border radii */
--shadow-xs, --shadow-sm, --shadow-md
--glow                           /* focus ring */
```

### Utility Classes

- `.sr-only` — visually hidden, accessible to screen readers

### App Shell

- `.app-shell` — flex container for sidebar + main
- `.sidebar` — fixed, 220px, dark (`#0f172a`)
- `.sidebar-logo`, `.sidebar-logo-icon`, `.sidebar-logo-text`, `.sidebar-logo-sub`
- `.sidebar-nav`, `.sidebar-nav-list`, `.sidebar-section-label`, `.sidebar-link`, `.sidebar-link.active`
- `.sidebar-footer`, `.sidebar-danger-btn`
- `.main-content` — `margin-left: var(--sidebar-w)`, flex column
- `.topbar` — sticky, 56px, white, flex row
- `.topbar-title`, `.topbar-subtitle`, `.topbar-badge`, `.badge-dot`
- `.page-body` — flex column, gap, padding

### KPI Cards

- `.kpi-row` — 4-column grid
- `.kpi-card` — white card with hover lift
- `.kpi-purple`, `.kpi-green`, `.kpi-red`, `.kpi-blue` — accent color variants
- `.kpi-icon`, `.kpi-body`, `.kpi-label`, `.kpi-value`, `.kpi-sub`

### Forms Row

- `.forms-row` — flex row, equal height
- `.forms-row-item` — flex: 1
- `.card-stretch`, `.card-body-stretch`, `.form-stretch` — height fill helpers
- `.form-spacer` — flexible spacer to push Set Budget button to bottom
- `.form-row-2` — 2-column grid for form fields
- `.field-group`, `.label-opt`
- `.error-msg` — inline validation error (prepends ⚠ when non-empty)

### Charts Row

- `.charts-row` — flex row
- `.charts-row-item` — flex: 1
- `.chart-body` — centered flex container for `<figure>`

### Dashboard Grid (Row 4)

- `.dashboard-grid` — `grid-template-columns: 1fr 420px`
- `.dashboard-col-main`, `.dashboard-col-side`

### Cards

- `.card`, `.card-header`, `.card-body`, `.card-title`, `.card-badge`, `.card-tag`

### Filter Bar

- `.filter-inline` — flex row, inline in card-header
- `.filter-field` — label + input/select column

### Tables

- `.expense-table`, `.amount-cell`, `.category-pill`
- `.summary-table`, `.budget-progress-wrap`, `.budget-progress-bar`, `.budget-progress-fill`, `.budget-progress-fill.over`, `.budget-progress-pct`
- `.over-budget-badge`
- `tr.over-budget` — red text on over-budget summary rows

### Empty States

- `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-sub`

### Buttons

- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-full`, `.btn-delete`

### Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `≤ 1280px` | Dashboard grid side column narrows to 360px |
| `≤ 1100px` | KPI row → 2 columns; charts stack; dashboard grid → 1 column |
| `≤ 900px` | Sidebar hidden (`--sidebar-w: 0px`); main-content margin reset |
| `≤ 640px` | KPI row → 2 columns; forms stack; charts stack; form-row-2 → 1 column; filter stacks |
| `≤ 400px` | KPI row → 1 column |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Add expense persists and appears in list

*For any* valid expense (positive amount, non-empty category, non-empty date), adding it via the add-expense function SHALL result in the expense being present in `localStorage` under `"ebv_expenses"` AND the rendered expense list DOM containing an entry for that expense.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Invalid amount is rejected for both forms

*For any* amount value that is zero or negative (including `0`, `-0.01`, `-999`), submitting either the expense form or the budget form SHALL return a validation error for the amount field and SHALL NOT modify `localStorage`.

**Validates: Requirements 1.4, 4.4**

---

### Property 3: Form is cleared after successful expense submission

*For any* valid expense submitted through the add-expense form, after the expense is saved the form's amount, category, description, and date fields SHALL all be reset to their default empty/unselected state.

**Validates: Requirements 1.7**

---

### Property 4: Expense list is always ordered by date descending

*For any* non-empty array of expenses with varying dates, the rendered expense list SHALL display entries in descending date order (most recent first), regardless of the order in which expenses were added.

**Validates: Requirements 2.1**

---

### Property 5: Every rendered expense entry is complete and has a delete control

*For any* expense in the expense list, the rendered DOM entry SHALL display the expense's amount, category, description, and date, AND SHALL contain a delete control element (`.btn-delete` with `data-id`).

**Validates: Requirements 2.3, 3.1**

---

### Property 6: Deleting an expense removes it from storage and display

*For any* expense present in the expense list, activating its delete control SHALL remove that expense from `localStorage` under `"ebv_expenses"` AND remove its corresponding entry from the rendered expense list DOM.

**Validates: Requirements 3.2, 3.3**

---

### Property 7: Budget save persists and is reflected in summary

*For any* valid (category, positive amount) pair, saving a budget SHALL store the amount under that category in `localStorage` under `"ebv_budgets"` AND the rendered summary SHALL display the new budget value for that category.

**Validates: Requirements 4.2, 4.5**

---

### Property 8: Budget overwrite replaces previous value

*For any* category that already has a budget set, saving a new budget amount for that same category SHALL result in `localStorage` containing only the new amount for that category (the old value SHALL be gone).

**Validates: Requirements 4.3**

---

### Property 9: Bar chart renders a bar for every spending category

*For any* set of expenses spanning one or more categories, calling `ChartModule.drawBarChart` SHALL produce canvas draw calls for each category that has spending, and for categories with a budget set SHALL include a dashed red budget reference line, while categories with no budget set SHALL have no budget reference line.

**Validates: Requirements 5.1, 5.4**

---

### Property 10: Pie chart renders a slice for every spending category

*For any* set of expenses spanning one or more categories, calling `ChartModule.drawPieChart` SHALL produce one arc draw call per category that has non-zero spending, with arc sizes proportional to each category's share of total spending, and SHALL render a legend below the pie.

**Validates: Requirements 5.2**

---

### Property 11: Summary displays spending and budget for each category

*For any* combination of expenses and budgets, the rendered summary SHALL contain one row per category that has either spending or a budget, showing the total spending amount and (if a budget exists) the budget limit and a progress bar for that category.

**Validates: Requirements 6.1**

---

### Property 12: Over-budget categories are visually distinguished in summary

*For any* category where the sum of expense amounts exceeds the category's budget, the rendered summary row for that category SHALL carry the CSS class `over-budget` (red text) and an `.over-budget-badge` element, both of which SHALL be absent from rows where spending does not exceed the budget.

**Validates: Requirements 6.2**

---

### Property 13: Categories without a budget show spending only

*For any* category that has expenses but no budget set, the rendered summary row SHALL display the total spending amount and SHALL NOT display a budget value, progress bar, or over-budget indicator for that category.

**Validates: Requirements 6.3**

---

### Property 14: Filter function returns only matching expenses

*For any* expense array and any combination of active filter criteria (start date, end date, category), every expense returned by `FilterModule.apply()` SHALL satisfy all active criteria, and no expense that satisfies all active criteria SHALL be omitted from the result.

**Validates: Requirements 7.2**

---

### Property 15: Clearing filters restores the full expense list

*For any* expense array and any previously applied filter, after calling `FilterModule.clear()` and re-rendering, the displayed expense list SHALL contain exactly the same expenses as the unfiltered `state.expenses` array.

**Validates: Requirements 7.3**

---

### Property 16: Active filter is reflected in summary totals

*For any* active filter state, the totals shown in the rendered summary SHALL equal the sum of amounts from only the filtered expense subset, not the full expense list.

**Validates: Requirements 7.4**

---

### Property 17: Persistence round-trip preserves all expense and budget data

*For any* set of expenses and budgets saved to `localStorage`, calling `StorageModule.load()` SHALL restore `state.expenses` and `state.budgets` to values deeply equal to the original data (same count, same field values for every record).

**Validates: Requirements 8.2**

---

### Property 18: Confirming clear-all empties all state and display

*For any* non-empty application state (expenses and/or budgets present), confirming the clear-all action SHALL result in `localStorage` containing empty arrays/objects for both keys AND the rendered UI showing the empty-state message with no expense entries or summary rows.

**Validates: Requirements 9.3**

---

### Property 19: Cancelling clear-all leaves all data intact

*For any* application state, cancelling the clear-all confirmation SHALL leave `localStorage` and `state` completely unchanged — every expense and budget present before the cancel SHALL still be present afterward.

**Validates: Requirements 9.4**

---

## Error Handling

### Validation Errors

- Inline error messages are rendered in a dedicated `<span class="error-msg">` element per field (id format: `${formId}-${field}-error`).
- Error spans use `role="alert" aria-live="polite"` and inputs use `aria-describedby` pointing to their error span.
- The `.error-msg` CSS rule prepends a ⚠ character when the span is non-empty.
- Errors are cleared on the next successful submission via `clearValidationErrors()`, which clears all `.error-msg` spans within the form.
- The form is not submitted (no state mutation, no localStorage write) when validation fails.

### localStorage Errors

- `StorageModule.load()` wraps all `localStorage` access in a `try/catch`.
- On `SecurityError` (storage blocked) or `SyntaxError` (corrupted JSON), the module initializes `state.expenses = []` and `state.budgets = {}`.
- `RenderModule.showWarningBanner()` is called with "Could not load saved data. Starting fresh." — the `#warning-banner` element (amber background, `role="alert"`) becomes visible.
- The banner does not block interaction; the user can still use the app for the current session.

### Empty States

- When the filtered expense list is empty, `#expense-list` renders a `.empty-state` block: icon + "No expenses yet" + "Add your first expense using the form above."
- When no categories have spending AND no budgets are set, `#summary` renders a `.empty-state` block: icon + "No data yet" + "Add expenses or set budgets to see your summary."
- Charts with no data render an empty canvas with centered "No data" text in `#94a3b8`.

### Confirmation Dialog

- The clear-all confirmation uses the browser's native `window.confirm()` dialog.
- If the user dismisses (Cancel / closes), no action is taken.
- This avoids building a custom modal while still satisfying the confirmation requirement.

---

## Testing Strategy

This feature is a client-side Vanilla JavaScript application with pure data-transformation logic (validation, filtering, sorting, aggregation) and DOM rendering. Property-based testing applies well to the pure logic layer.

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript PBT library, no framework dependency)

**Configuration**: Each property test runs a minimum of **100 iterations**.

**Tag format**: Each property test is tagged with a comment:
```
// Feature: expense-budget-visualizer, Property N: <property_text>
```

**Scope**: Property tests target the pure functions in the logical modules:
- `ValidationModule.validateExpense` / `validateBudget`
- `FilterModule.apply`
- The sorting logic used by `RenderModule.renderExpenseList`
- `StorageModule.load` / `save` (with mocked `localStorage`)
- Summary aggregation logic in `RenderModule.renderSummary`
- `ChartModule._aggregateByCategory` and `ChartModule._colorFor`

Each of the 19 correctness properties above maps to one property-based test.

### Unit Tests (Example-Based)

Unit tests cover:
- Structural checks (form fields exist, delete controls exist, filter controls exist, KPI stat card elements exist)
- Edge cases: empty expense list empty-state message, empty category/date validation errors, localStorage parse error handling
- Specific interaction flows: add expense → form cleared, confirm clear-all → empty state, cancel clear-all → state unchanged
- Chart rendering with zero-data inputs (renders "No data" text)
- `renderStatCards` updates `#stat-total`, `#stat-count`, `#stat-budgets`, `#stat-over`

### Integration / Smoke Tests

- Verify `localStorage` keys are exactly `"ebv_expenses"` and `"ebv_budgets"` after a save
- Verify no external script tags or imports reference charting libraries
- Verify the sidebar nav links (`#kpi-row`, `#panel-add-expense`, `#panel-set-budget`, `#panel-charts`, `#panel-summary`, `#panel-expenses`) resolve to existing elements

### Test File Location

Since the project constraint is a single `js/script.js` file with no test setup required, tests are described here as a specification for manual verification or future test harness setup. If a test runner is added, tests would live in `js/script.test.js` using fast-check with a jsdom environment.
