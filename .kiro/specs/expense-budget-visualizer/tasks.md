# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a fully client-side single-page application using plain HTML, CSS, and Vanilla JavaScript. All logic lives in `js/script.js`, all styling in `css/style.css`, and structure in `index.html`. Data is persisted via `localStorage`. The implementation follows the MVC pattern described in the design: Storage → State → Validation/Filter → Render → Charts, all wired together in a single `init()` function.

## Tasks

- [x] 1. Build the HTML structure in `index.html`
  - Add `<link>` to `css/style.css` and `<script defer>` to `js/script.js` in the `<head>`
  - Add the Add Expense form (`#expense-form`) with fields: amount, category (select), description, date, and a submit button; include an `<span>` error element per field
  - Add the Set Budget form (`#budget-form`) with fields: category (select) and amount; include an `<span>` error element per field
  - Add the filter controls section (`#filter-controls`) with start date, end date, category select, and a clear-filters button
  - Add the expense list container (`#expense-list`)
  - Add the spending summary container (`#summary`)
  - Add two `<canvas>` elements: `#bar-chart` and `#pie-chart`
  - Add a clear-all-data button (`#clear-all-btn`) and a warning banner element (`#warning-banner`, hidden by default)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.5, 7.1, 9.1_

- [x] 2. Implement the State object and Storage Module in `js/script.js`
  - [x] 2.1 Define the `CATEGORIES` constant array and the `state` object (`expenses`, `budgets`, `filters`)
    - _Requirements: 1.1, 4.1, 8.1_
  - [x] 2.2 Implement `StorageModule.save()` — serializes `state.expenses` and `state.budgets` to `localStorage` under keys `"ebv_expenses"` and `"ebv_budgets"`
    - _Requirements: 8.1_
  - [x] 2.3 Implement `StorageModule.load()` — reads both keys from `localStorage`, parses JSON, populates `state`; wraps in `try/catch` and falls back to empty state + shows warning banner on error
    - _Requirements: 8.2, 8.3_
  - [x] 2.4 Implement `StorageModule.clear()` — removes both `localStorage` keys and resets `state.expenses` and `state.budgets`
    - _Requirements: 9.3_

- [x] 3. Implement the Validation Module in `js/script.js`
  - [x] 3.1 Implement `ValidationModule.validateExpense(formData)` — checks `amount > 0`, `category` not empty, `date` not empty; returns `{ valid, errors }`
    - _Requirements: 1.4, 1.5, 1.6_
  - [x] 3.2 Implement `ValidationModule.validateBudget(formData)` — checks `amount > 0`, `category` not empty; returns `{ valid, errors }`
    - _Requirements: 4.4_

- [x] 4. Implement the Filter Module in `js/script.js`
  - [x] 4.1 Implement `FilterModule.apply(expenses, filters)` — chains date-range filter then category filter; returns filtered array without mutating the original
    - _Requirements: 7.2_
  - [x] 4.2 Implement `FilterModule.clear()` — resets `state.filters` to all-null
    - _Requirements: 7.3_

- [x] 5. Implement the Render Module — expense list and summary
  - [x] 5.1 Implement `RenderModule.renderExpenseList(expenses)` — clears `#expense-list` and renders one row per expense (amount, category, description, date, delete button), sorted by date descending; renders "No expenses recorded yet." when empty
    - _Requirements: 2.1, 2.2, 2.3, 3.1_
  - [x] 5.2 Implement `RenderModule.renderSummary(expenses, budgets)` — aggregates total spending per category; renders one row per category with spending and budget (if set); applies over-budget CSS class when spending exceeds budget; renders "No budgets set." placeholder when appropriate
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 5.3 Implement `RenderModule.renderValidationErrors(errors, formId)` and `RenderModule.clearValidationErrors(formId)` — shows/clears inline error messages in the `<span>` elements adjacent to each field
    - _Requirements: 1.4, 1.5, 1.6, 4.4_
  - [x] 5.4 Implement `RenderModule.showWarningBanner(message)` — makes `#warning-banner` visible with the given message
    - _Requirements: 8.3_
  - [x] 5.5 Implement `RenderModule.refresh()` — computes the filtered expense list once using `FilterModule.apply`, then calls `renderExpenseList`, `renderSummary`, and both chart draw functions
    - _Requirements: 3.3, 4.5, 5.3, 6.4, 7.4_

- [ ] 6. Checkpoint — core rendering pipeline
  - Ensure `StorageModule`, `ValidationModule`, `FilterModule`, and `RenderModule` are all defined and callable. Ask the user if any questions arise before continuing.

- [x] 7. Implement the Chart Module in `js/script.js`
  - [x] 7.1 Implement `ChartModule.drawBarChart(canvas, expenses, budgets)` — clears the canvas, aggregates spending per category, draws one bar per category, draws a budget reference line for categories with a budget set, renders "No data" text when expenses is empty
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 7.2 Implement `ChartModule.drawPieChart(canvas, expenses)` — clears the canvas, aggregates spending per category, draws one arc per category with non-zero spending proportional to total, assigns colors from a fixed palette, renders "No data" text when expenses is empty
    - _Requirements: 5.2, 5.5_

- [x] 8. Implement event handlers and `init()` in `js/script.js`
  - [x] 8.1 Implement the add-expense form submit handler — reads form fields, calls `ValidationModule.validateExpense`, on failure calls `renderValidationErrors`; on success creates an Expense object (with `id`, `amount`, `category`, `description`, `date`), pushes to `state.expenses`, calls `StorageModule.save()`, clears the form, calls `RenderModule.refresh()`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 8.2 Implement the delete-expense handler (event-delegated on `#expense-list`) — finds the expense by `id`, removes it from `state.expenses`, calls `StorageModule.save()`, calls `RenderModule.refresh()`
    - _Requirements: 3.2, 3.3_
  - [x] 8.3 Implement the set-budget form submit handler — reads form fields, calls `ValidationModule.validateBudget`, on failure calls `renderValidationErrors`; on success sets `state.budgets[category] = amount`, calls `StorageModule.save()`, calls `RenderModule.refresh()`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 8.4 Implement the filter controls change/submit handler — reads filter field values into `state.filters`, calls `RenderModule.refresh()`
    - _Requirements: 7.1, 7.2_
  - [x] 8.5 Implement the clear-filters button handler — calls `FilterModule.clear()`, resets filter field values in the DOM, calls `RenderModule.refresh()`
    - _Requirements: 7.3_
  - [x] 8.6 Implement the clear-all-data button handler — calls `window.confirm()` for confirmation; on confirm calls `StorageModule.clear()`, resets `state.filters`, calls `RenderModule.refresh()`; on cancel takes no action
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 8.7 Implement `init()` — populates both category `<select>` dropdowns from `CATEGORIES`, attaches all event listeners, calls `StorageModule.load()`, calls `RenderModule.refresh()`; wire to `DOMContentLoaded`
    - _Requirements: 1.1, 4.1, 8.2_

- [ ] 9. Checkpoint — full application wired together
  - Ensure all modules are connected through `init()`, the app loads without console errors, expenses can be added and deleted, budgets can be set, and charts render. Ask the user if any questions arise before continuing.

- [x] 10. Style the application in `css/style.css`
  - Apply a clean, minimal layout: page max-width, readable typography, consistent spacing
  - Style the two forms side by side (or stacked on small screens) with clear labels and input styling
  - Style the expense list as a table or card list with alternating row colors and a visible delete button per row
  - Style the summary section with a two-column layout (category / spending vs. budget); apply a distinct color (e.g., red text or background tint) to over-budget rows using the CSS class set by `renderSummary`
  - Style the filter controls as a compact inline row
  - Style the charts section with the two canvases displayed side by side (or stacked on small screens)
  - Add responsive breakpoints so the layout stacks gracefully on narrow viewports
  - Style the warning banner as a non-blocking top-of-page notice (yellow/amber background)
  - Style the clear-all button as a visually distinct destructive action (e.g., red outline)
  - _Requirements: 6.2 (over-budget indicator), non-functional requirements (clean/minimal, responsive)_

- [x] 11. Final checkpoint — end-to-end verification
  - Open `index.html` in a browser and verify: adding an expense updates the list, summary, and charts; deleting an expense updates all three; setting a budget updates the summary and bar chart; filters narrow the list, summary, and charts; clear-all resets everything; refreshing the page restores all data from `localStorage`. Ask the user if any questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints (tasks 6, 9, 11) ensure incremental validation at key milestones
- No test framework is required — all verification is done manually via the browser
- Charts are rendered using HTML canvas and Vanilla JavaScript only — no external charting libraries
- The single-file constraint (`js/script.js`, `css/style.css`) is respected throughout — no additional files are created
