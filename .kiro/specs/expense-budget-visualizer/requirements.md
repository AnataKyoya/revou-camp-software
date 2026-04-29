# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track their personal expenses, set budget limits per category, and visualize spending patterns through charts and summaries. All data is stored in the browser's Local Storage — no backend or account required. The app is built with plain HTML, CSS, and Vanilla JavaScript, making it lightweight and easy to run as a standalone web page or browser extension.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Expense**: A single spending record consisting of an amount, category, description, and date.
- **Budget**: A user-defined spending limit assigned to a specific category for the current period.
- **Category**: A label used to group expenses (e.g., Food, Transport, Entertainment).
- **Local_Storage**: The browser's built-in Web Storage API used to persist data client-side.
- **Expense_List**: The collection of all recorded expenses stored in Local_Storage.
- **Budget_List**: The collection of all category budgets stored in Local_Storage.
- **Summary**: An aggregated view showing total spending per category compared to the budget.
- **Chart**: A visual representation (bar or pie) of spending data rendered on an HTML canvas element.
- **Filter**: A user-applied constraint that limits which expenses are displayed (by date range or category).

---

## Requirements

### Requirement 1: Add an Expense

**User Story:** As a user, I want to add a new expense with an amount, category, description, and date, so that I can keep a record of my spending.

#### Acceptance Criteria

1. THE App SHALL provide a form with fields for amount (numeric), category (selectable), description (text), and date.
2. WHEN the user submits the expense form with all required fields filled, THE App SHALL save the expense to the Expense_List in Local_Storage.
3. WHEN the user submits the expense form with all required fields filled, THE App SHALL display the new expense in the expense list without reloading the page.
4. IF the user submits the expense form with the amount field empty or set to zero or below, THEN THE App SHALL display an inline validation error and SHALL NOT save the expense.
5. IF the user submits the expense form with the category field unselected, THEN THE App SHALL display an inline validation error and SHALL NOT save the expense.
6. IF the user submits the expense form with the date field empty, THEN THE App SHALL display an inline validation error and SHALL NOT save the expense.
7. WHEN an expense is successfully saved, THE App SHALL clear the form fields and return the form to its default empty state.

---

### Requirement 2: View Expense List

**User Story:** As a user, I want to see a list of all my recorded expenses, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL display all expenses from the Expense_List on the main page, ordered by date descending (most recent first).
2. WHEN the Expense_List is empty, THE App SHALL display a message indicating that no expenses have been recorded yet.
3. THE App SHALL display each expense entry showing its amount, category, description, and date.

---

### Requirement 3: Delete an Expense

**User Story:** As a user, I want to delete an expense, so that I can remove incorrect or unwanted records.

#### Acceptance Criteria

1. THE App SHALL display a delete control for each expense entry in the expense list.
2. WHEN the user activates the delete control for an expense, THE App SHALL remove that expense from the Expense_List in Local_Storage.
3. WHEN an expense is deleted, THE App SHALL update the expense list display and the Summary without reloading the page.

---

### Requirement 4: Set a Category Budget

**User Story:** As a user, I want to set a spending budget for each category, so that I can control how much I spend in each area.

#### Acceptance Criteria

1. THE App SHALL provide a form to assign a budget amount to a category.
2. WHEN the user submits the budget form with a valid category and a positive numeric amount, THE App SHALL save the budget to the Budget_List in Local_Storage.
3. WHEN a budget for a category already exists and the user submits a new budget for the same category, THE App SHALL overwrite the existing budget with the new value.
4. IF the user submits the budget form with the amount field empty or set to zero or below, THEN THE App SHALL display an inline validation error and SHALL NOT save the budget.
5. WHEN a budget is successfully saved, THE App SHALL update the Summary display to reflect the new budget value.

---

### Requirement 5: Visualize Spending with Charts

**User Story:** As a user, I want to see charts of my spending, so that I can quickly understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL render a bar chart comparing total spending per category against the category budget.
2. THE App SHALL render a pie chart showing the proportional breakdown of total spending across all categories.
3. WHEN the Expense_List changes (expense added or deleted), THE App SHALL update both charts to reflect the current data without reloading the page.
4. WHEN a category has no budget set, THE App SHALL render the bar chart for that category showing only the spending amount with no budget reference line.
5. THE App SHALL render charts using the HTML canvas element and Vanilla JavaScript only, with no external charting libraries.

---

### Requirement 6: View Spending Summary

**User Story:** As a user, I want to see a summary of my spending per category compared to my budget, so that I can know if I am over or under budget.

#### Acceptance Criteria

1. THE App SHALL display a Summary showing each category's total spending and its budget limit side by side.
2. WHEN a category's total spending exceeds its budget, THE App SHALL visually distinguish that category in the Summary (e.g., using a different color or indicator).
3. WHEN a category has no budget set, THE App SHALL display the total spending for that category without a budget comparison.
4. WHEN the Expense_List or Budget_List changes, THE App SHALL update the Summary without reloading the page.

---

### Requirement 7: Filter Expenses

**User Story:** As a user, I want to filter my expenses by date range or category, so that I can focus on specific spending periods or areas.

#### Acceptance Criteria

1. THE App SHALL provide controls to filter the expense list by a start date, an end date, or a category, individually or in combination.
2. WHEN the user applies a Filter, THE App SHALL display only the expenses that match all active filter criteria.
3. WHEN the user clears all filters, THE App SHALL display the full unfiltered Expense_List.
4. WHEN a Filter is active, THE App SHALL update the Summary and charts to reflect only the filtered expenses.

---

### Requirement 8: Persist Data Across Sessions

**User Story:** As a user, I want my expenses and budgets to be saved between browser sessions, so that I do not lose my data when I close the tab.

#### Acceptance Criteria

1. THE App SHALL store all Expense_List and Budget_List data in Local_Storage using a consistent key naming scheme.
2. WHEN the App is loaded, THE App SHALL read the Expense_List and Budget_List from Local_Storage and restore the full application state.
3. WHEN Local_Storage is unavailable or returns a parse error, THE App SHALL initialize with an empty Expense_List and Budget_List and display a non-blocking warning to the user.

---

### Requirement 9: Clear All Data

**User Story:** As a user, I want to clear all my recorded data, so that I can start fresh without manually deleting each entry.

#### Acceptance Criteria

1. THE App SHALL provide a control to clear all data (Expense_List and Budget_List).
2. WHEN the user activates the clear-all control, THE App SHALL display a confirmation prompt before deleting any data.
3. WHEN the user confirms the clear-all action, THE App SHALL remove all entries from the Expense_List and Budget_List in Local_Storage and reset the display to its empty state.
4. WHEN the user cancels the clear-all confirmation, THE App SHALL take no action and leave all data intact.
