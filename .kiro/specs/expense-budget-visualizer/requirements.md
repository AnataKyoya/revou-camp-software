# Requirements Document

## Introduction

The Expense & Budget Visualizer (branded **Spendly**) is a client-side web application that allows users to track personal expenses, set budget limits per category, and visualize spending patterns through charts and summaries. All data is stored in the browser's Local Storage — no backend or account required. The app is built with plain HTML5, CSS3, and Vanilla JavaScript (no frameworks, no npm, no build tools), making it lightweight and runnable as a standalone web page.

The UI follows a SaaS dashboard design: a fixed dark sidebar for navigation, a sticky topbar, and a four-row main content area containing KPI stat cards, input forms, canvas charts, and a filterable transaction list alongside a budget summary.

## Glossary

- **App**: The Expense & Budget Visualizer (Spendly) web application.
- **Expense**: A single spending record consisting of an amount, category, description, and date.
- **Budget**: A user-defined spending limit assigned to a specific category.
- **Category**: A label used to group expenses. Predefined values: Food, Transport, Entertainment, Health, Housing, Shopping, Other.
- **Local_Storage**: The browser's built-in Web Storage API used to persist data client-side under keys `"ebv_expenses"` and `"ebv_budgets"`.
- **Expense_List**: The collection of all recorded expenses stored in Local_Storage.
- **Budget_List**: The collection of all category budgets stored in Local_Storage.
- **KPI Cards**: Four stat cards at the top of the dashboard showing Total Spent, Budgets Active, Over Budget, and Categories with spending.
- **Summary**: An aggregated table showing total spending per category compared to the budget, with a progress bar.
- **Chart**: A visual representation (bar or pie) of spending data rendered on an HTML canvas element using Vanilla JavaScript only.
- **Filter**: A user-applied constraint that limits which expenses are displayed (by date range or category).
- **Sidebar**: The fixed 220px dark navigation panel containing the app logo, nav links, and the Clear All Data button.

---

## Requirements

### Requirement 1: Add an Expense

**User Story:** As a user, I want to add a new expense with an amount, category, description, and date, so that I can keep a record of my spending.

#### Acceptance Criteria

1. THE App SHALL provide a form (in the "Add Expense" card, ROW 2 of the dashboard) with fields for amount (numeric), category (select from predefined list), date, and description (optional text).
2. WHEN the user submits the expense form with all required fields filled, THE App SHALL save the expense to the Expense_List in Local_Storage under key `"ebv_expenses"`.
3. WHEN the user submits the expense form with all required fields filled, THE App SHALL display the new expense in the Transactions list and update the KPI cards and charts without reloading the page.
4. IF the user submits the expense form with the amount field empty or set to zero or below, THEN THE App SHALL display an inline validation error adjacent to the amount field and SHALL NOT save the expense.
5. IF the user submits the expense form with the category field unselected, THEN THE App SHALL display an inline validation error adjacent to the category field and SHALL NOT save the expense.
6. IF the user submits the expense form with the date field empty, THEN THE App SHALL display an inline validation error adjacent to the date field and SHALL NOT save the expense.
7. WHEN an expense is successfully saved, THE App SHALL clear the form fields and return the form to its default empty state.

---

### Requirement 2: View Expense List

**User Story:** As a user, I want to see a list of all my recorded expenses, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL display all expenses from the Expense_List in the Transactions card (ROW 4, left column), ordered by date descending (most recent first).
2. WHEN the Expense_List is empty (or the filtered result is empty), THE App SHALL display an empty-state message indicating that no expenses have been recorded yet.
3. THE App SHALL display each expense entry in a table showing its amount, category (as a pill badge), description, and date.
4. THE App SHALL display a live count badge (`#expense-count-badge`) in the Transactions card header showing the number of currently displayed entries.

---

### Requirement 3: Delete an Expense

**User Story:** As a user, I want to delete an expense, so that I can remove incorrect or unwanted records.

#### Acceptance Criteria

1. THE App SHALL display a delete button for each expense row in the Transactions table.
2. WHEN the user activates the delete button for an expense, THE App SHALL remove that expense from the Expense_List in Local_Storage.
3. WHEN an expense is deleted, THE App SHALL update the Transactions list, KPI cards, Summary, and charts without reloading the page.

---

### Requirement 4: Set a Category Budget

**User Story:** As a user, I want to set a spending budget for each category, so that I can control how much I spend in each area.

#### Acceptance Criteria

1. THE App SHALL provide a form (in the "Set Budget" card, ROW 2 of the dashboard) to assign a budget limit to a category selected from the predefined list.
2. WHEN the user submits the budget form with a valid category and a positive numeric amount, THE App SHALL save the budget to the Budget_List in Local_Storage under key `"ebv_budgets"`.
3. WHEN a budget for a category already exists and the user submits a new budget for the same category, THE App SHALL overwrite the existing budget with the new value.
4. IF the user submits the budget form with the amount field empty or set to zero or below, THEN THE App SHALL display an inline validation error adjacent to the amount field and SHALL NOT save the budget.
5. WHEN a budget is successfully saved, THE App SHALL update the Summary and bar chart to reflect the new budget value without reloading the page.

---

### Requirement 5: Visualize Spending with Charts

**User Story:** As a user, I want to see charts of my spending, so that I can quickly understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL render a bar chart (`#bar-chart`, 520×240 canvas) comparing total spending per category against the category budget, with y-axis gridlines and x-axis category labels.
2. THE App SHALL render a pie chart (`#pie-chart`, 520×240 canvas) showing the proportional breakdown of total spending across all categories, with a color legend below the pie.
3. WHEN the Expense_List changes (expense added or deleted), THE App SHALL update both charts to reflect the current data without reloading the page.
4. WHEN a category has no budget set, THE App SHALL render the bar chart for that category showing only the spending bar with no budget reference line. WHEN a budget is set, a dashed red horizontal reference line SHALL be drawn at the budget level.
5. THE App SHALL render charts using the HTML canvas element and Vanilla JavaScript Canvas 2D API only, with no external charting libraries.
6. WHEN the expense list is empty, both charts SHALL display centered "No data" text on the canvas.

---

### Requirement 6: View Spending Summary

**User Story:** As a user, I want to see a summary of my spending per category compared to my budget, so that I can know if I am over or under budget.

#### Acceptance Criteria

1. THE App SHALL display a Budget Summary table (ROW 4, right column) showing each category's total spending, budget limit, and a progress bar side by side.
2. WHEN a category's total spending exceeds its budget, THE App SHALL apply the `over-budget` CSS class to that row (red text) and display an "Over" badge, both of which SHALL be absent from rows where spending does not exceed the budget.
3. WHEN a category has no budget set, THE App SHALL display the total spending for that category with a "—" placeholder in the Budget and Progress columns.
4. WHEN the Expense_List or Budget_List changes, THE App SHALL update the Summary without reloading the page.

---

### Requirement 7: Filter Expenses

**User Story:** As a user, I want to filter my expenses by date range or category, so that I can focus on specific spending periods or areas.

#### Acceptance Criteria

1. THE App SHALL provide a Filter card (ROW 4, above the Transactions card) with controls for a start date ("From"), an end date ("To"), a category select, and a "Clear" button — all inline in the card header.
2. WHEN the user changes any filter field, THE App SHALL display only the expenses that match all active filter criteria.
3. WHEN the user clicks the Clear button, THE App SHALL reset all filter fields and display the full unfiltered Expense_List.
4. WHEN a Filter is active, THE App SHALL update the Summary, KPI cards, and charts to reflect only the filtered expenses.

---

### Requirement 8: Persist Data Across Sessions

**User Story:** As a user, I want my expenses and budgets to be saved between browser sessions, so that I do not lose my data when I close the tab.

#### Acceptance Criteria

1. THE App SHALL store all Expense_List data in Local_Storage under key `"ebv_expenses"` (JSON array) and all Budget_List data under key `"ebv_budgets"` (JSON object keyed by category name).
2. WHEN the App is loaded, THE App SHALL read both keys from Local_Storage and restore the full application state, including re-rendering the KPI cards, Transactions list, Summary, and charts.
3. WHEN Local_Storage is unavailable or returns a parse error, THE App SHALL initialize with an empty Expense_List and Budget_List and display a non-blocking amber warning banner (`#warning-banner`) at the top of the page.

---

### Requirement 9: Clear All Data

**User Story:** As a user, I want to clear all my recorded data, so that I can start fresh without manually deleting each entry.

#### Acceptance Criteria

1. THE App SHALL provide a "Clear All Data" button in the sidebar footer (`#clear-all-btn`).
2. WHEN the user activates the clear-all button, THE App SHALL display a native browser confirmation dialog before deleting any data.
3. WHEN the user confirms the clear-all action, THE App SHALL remove all entries from the Expense_List and Budget_List in Local_Storage and reset the entire display to its empty state (empty-state messages in Transactions and Summary, "No data" in charts, zeroed KPI cards).
4. WHEN the user cancels the clear-all confirmation, THE App SHALL take no action and leave all data intact.

---

### Requirement 10: Dashboard KPI Cards

**User Story:** As a user, I want to see key metrics at a glance at the top of the dashboard, so that I can quickly assess my financial status.

#### Acceptance Criteria

1. THE App SHALL display four KPI stat cards in a full-width row at the top of the dashboard (ROW 1): Total Spent (purple), Budgets Active (green), Over Budget (red), and Categories with spending (blue).
2. THE App SHALL update the Total Spent card (`#stat-total`) to show the sum of all currently displayed (filtered) expense amounts, formatted as USD currency.
3. THE App SHALL update the Budgets Active card (`#stat-budgets`) to show the count of categories that have a budget set.
4. THE App SHALL update the Over Budget card (`#stat-over`) to show the count of categories where spending exceeds the budget.
5. WHEN the Expense_List, Budget_List, or active filter changes, THE App SHALL update all KPI cards without reloading the page.

---

### Requirement 11: Sidebar Navigation

**User Story:** As a user, I want a persistent navigation sidebar, so that I can quickly jump to any section of the dashboard.

#### Acceptance Criteria

1. THE App SHALL display a fixed dark sidebar (220px wide) containing the app logo ("Spendly"), grouped navigation links, and a "Clear All Data" button in the footer.
2. THE sidebar navigation SHALL include links to: Dashboard (KPI row), Add Expense, Set Budget, Charts, Summary, and Transactions — each scrolling to the corresponding section anchor.
3. WHEN the viewport width is 900px or below, THE App SHALL hide the sidebar and remove the main content left margin, providing a full-width layout.
