# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a fully client-side single-page application (SPA) built with plain HTML, CSS, and Vanilla JavaScript. It allows users to record expenses, set per-category budgets, visualize spending via canvas-rendered charts, and filter/summarize their data — all without a backend or external libraries.

All state is persisted in the browser's `localStorage`. The entire application lives in three files:

- `index.html` — structure and markup
- `css/style.css` — all styling
- `js/script.js` — all application logic

The UI is divided into four logical sections rendered on a single page:

1. **Add Expense / Set Budget** — input forms
2. **Expense List** — filterable, deletable table of records
3. **Spending Summary** — per-category totals vs. budgets
4. **Charts** — bar chart and pie chart rendered on `<canvas>`

---

## Architecture

The application follows a simple **Model → View → Controller** pattern implemented entirely in `script.js`, without any framework.

```
┌─────────────────────────────────────────────────────────┐
│                        index.html                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Add Form  │  │Expense   │  │Summary   │  │Charts  │  │
│  │Budget    │  │List      │  │Panel     │  │Canvas  │  │
│  │Form      │  │+ Filters │  │          │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
         │                │
         ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      script.js                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  State (in-memory mirror of localStorage)        │   │
│  │  { expenses: [...], budgets: {...} }              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Storage Module  (read/write localStorage)       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Validation Module  (form input checks)          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Filter Module  (date range + category filter)   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Render Module  (DOM updates for list, summary)  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Chart Module  (canvas bar chart + pie chart)    │   │
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
3. After every state mutation, the Render Module re-renders the expense list, summary panel, and both charts using the current (possibly filtered) state.

### Key Design Decisions

- **Single source of truth**: The in-memory `state` object is always a mirror of `localStorage`. All reads go through state; all writes go through the Storage Module which updates both.
- **Full re-render on change**: Rather than fine-grained DOM patching, every state change triggers a full re-render of affected sections. Given the scale of this app, this is simpler and fast enough.
- **No IDs from the server**: Expenses are assigned a `id` using `Date.now() + Math.random()` at creation time, which is sufficient for a client-only app.
- **Canvas charts drawn from scratch**: On every relevant state change, the canvas context is cleared and charts are redrawn. This avoids stale state in chart objects.

---

## Components and Interfaces

All components are plain JavaScript functions/objects within `script.js`. There are no classes required, but logical grouping via object literals or module-pattern IIFEs is used for clarity.

### 1. State Object

```js
const state = {
  expenses: [],   // Array<Expense>
  budgets: {},    // { [category: string]: number }
  filters: {
    startDate: null,   // string | null  (YYYY-MM-DD)
    endDate: null,     // string | null
    category: null,    // string | null
  }
};
```

### 2. Storage Module

```js
StorageModule = {
  load()          // → void  — reads localStorage, populates state
  save()          // → void  — serializes state.expenses + state.budgets to localStorage
  clear()         // → void  — removes both keys from localStorage
}
```

- Keys: `"ebv_expenses"` and `"ebv_budgets"`
- On parse error or unavailability, initializes with empty arrays/objects and shows a warning banner.

### 3. Validation Module

```js
ValidationModule = {
  validateExpense(formData)  // → { valid: boolean, errors: { field: string } }
  validateBudget(formData)   // → { valid: boolean, errors: { field: string } }
}
```

- Expense rules: `amount > 0`, `category` not empty, `date` not empty, `description` optional.
- Budget rules: `amount > 0`, `category` not empty.
- Returns an errors map keyed by field name so the Render Module can display inline messages.

### 4. Filter Module

```js
FilterModule = {
  apply(expenses, filters)  // → Array<Expense>  — returns filtered subset
  clear()                   // → void  — resets state.filters to all-null
}
```

- Filtering is non-destructive: the original `state.expenses` array is never modified.
- `apply()` chains: date-range filter → category filter.

### 5. Render Module

```js
RenderModule = {
  renderExpenseList(expenses)   // → void  — updates #expense-list DOM
  renderSummary(expenses, budgets)  // → void  — updates #summary DOM
  renderValidationErrors(errors, formId)  // → void  — shows inline errors
  clearValidationErrors(formId)  // → void
  showWarningBanner(message)    // → void
  refresh()                     // → void  — calls all render functions with current filtered state
}
```

- `refresh()` is the single entry point called after every state mutation.
- It computes the filtered expense list once and passes it to all sub-renderers and the Chart Module.

### 6. Chart Module

```js
ChartModule = {
  drawBarChart(canvas, expenses, budgets)  // → void
  drawPieChart(canvas, expenses)           // → void
}
```

- Both functions accept a `<canvas>` element and data; they clear and redraw from scratch.
- Bar chart: one bar per category showing spending; a horizontal reference line per category showing budget (if set).
- Pie chart: one slice per category, proportional to total spending. Categories with zero spending are omitted.
- Colors are assigned from a fixed palette array, cycling if there are more categories than colors.

### 7. Event Handlers (wired in `init()`)

```js
init()  // → void  — attaches all event listeners, calls StorageModule.load(), RenderModule.refresh()
```

Event handlers are attached once on `DOMContentLoaded`. They call the appropriate module functions and then call `RenderModule.refresh()`.

---

## Data Models

### Expense

```js
{
  id: string,           // unique identifier: `${Date.now()}-${Math.random()}`
  amount: number,       // positive float, e.g. 42.50
  category: string,     // e.g. "Food", "Transport", "Entertainment"
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

The category dropdown is populated from a fixed list defined in `script.js`:

```js
const CATEGORIES = [
  "Food", "Transport", "Entertainment",
  "Health", "Housing", "Shopping", "Other"
];
```

This list is used to populate both the expense form and the budget form dropdowns.

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

*For any* expense in the expense list, the rendered DOM entry SHALL display the expense's amount, category, description, and date, AND SHALL contain a delete control element.

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

*For any* set of expenses spanning one or more categories, calling `drawBarChart` SHALL produce canvas draw calls for each category that has spending, and for categories with a budget set SHALL include a budget reference line, while categories with no budget set SHALL have no budget reference line.

**Validates: Requirements 5.1, 5.4**

---

### Property 10: Pie chart renders a slice for every spending category

*For any* set of expenses spanning one or more categories, calling `drawPieChart` SHALL produce one arc draw call per category that has non-zero spending, with arc sizes proportional to each category's share of total spending.

**Validates: Requirements 5.2**

---

### Property 11: Summary displays spending and budget for each category

*For any* combination of expenses and budgets, the rendered summary SHALL contain one row per category that has either spending or a budget, showing the total spending amount and (if a budget exists) the budget limit for that category.

**Validates: Requirements 6.1**

---

### Property 12: Over-budget categories are visually distinguished in summary

*For any* category where the sum of expense amounts exceeds the category's budget, the rendered summary row for that category SHALL carry a visual over-budget indicator (e.g., a CSS class or inline style) that is absent from rows where spending does not exceed the budget.

**Validates: Requirements 6.2**

---

### Property 13: Categories without a budget show spending only

*For any* category that has expenses but no budget set, the rendered summary row SHALL display the total spending amount and SHALL NOT display a budget value or over-budget indicator for that category.

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

- Inline error messages are rendered adjacent to the offending field using a dedicated error `<span>` element per field.
- Errors are cleared on the next successful submission or when the user modifies the field.
- The form is not submitted (no state mutation, no localStorage write) when validation fails.

### localStorage Errors

- `StorageModule.load()` wraps all `localStorage` access in a `try/catch`.
- On `SecurityError` (storage blocked) or `SyntaxError` (corrupted JSON), the module initializes `state.expenses = []` and `state.budgets = {}`.
- A non-blocking warning banner is shown at the top of the page (e.g., "Could not load saved data. Starting fresh.").
- The banner does not block interaction; the user can still use the app for the current session.

### Empty States

- When `state.expenses` is empty (or the filtered result is empty), the expense list section renders a placeholder message: "No expenses recorded yet."
- When no budgets are set, the summary section renders a placeholder: "No budgets set."
- Charts with no data render an empty canvas with a centered "No data" text label.

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
- Summary aggregation logic
- Chart data preparation functions (not canvas draw calls directly)

Each of the 19 correctness properties above maps to one property-based test.

### Unit Tests (Example-Based)

Unit tests cover:
- Structural checks (form fields exist, delete controls exist, filter controls exist)
- Edge cases: empty expense list message, empty category/date validation errors, localStorage parse error handling
- Specific interaction flows: add expense → form cleared, confirm clear-all → empty state, cancel clear-all → state unchanged
- Chart rendering with zero-data inputs

### Integration / Smoke Tests

- Verify `localStorage` keys are exactly `"ebv_expenses"` and `"ebv_budgets"` after a save
- Verify no external script tags or imports reference charting libraries

### Test File Location

Since the project constraint is a single `js/script.js` file with no test setup required, tests are described here as a specification for manual verification or future test harness setup. If a test runner is added, tests would live in `js/script.test.js` using fast-check with a jsdom environment.
