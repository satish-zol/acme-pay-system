# ACME Salary Management — Requirements

## Goal
Replace HR's spreadsheets with a secure, dependable web application for managing salary records for 10,000 employees across countries. HR managers need to find and update an employee's pay and answer basic, timely questions about how the organization pays people.

## Scope and features
- **Employee directory:** browse a paginated employee list; search by name or email; filter by country and department; sort by name or salary. Show each employee's name, role, department, country, currency, and annual salary.
- **Salary management:** view and edit an employee's annual base salary and currency with clear validation and feedback. Keep personal data to the minimum needed for these workflows.
- **Compensation overview:** show headcount, average and median annual salary, and salary ranges by country/currency and department. Label currency-specific figures explicitly; never imply that unlike currencies are directly comparable.
- **Scale and reliability:** persist data in PostgreSQL; paginate and filter on the server; seed 10,000 reproducible, representative demo employees; provide automated tests and documented local setup.
- **Interface:** responsive React dashboard with accessible controls, useful empty/loading/error states, and a component library.

## Deliberately out of scope
- **Payroll execution, tax, benefits, and payslips:** this is a salary-data management and exploration tool, not a payroll processor or legal/tax system.
- **Authentication, authorization, and audit history in this demo:** essential before real employee data is used, but require organization-specific identity, access policy, retention, and compliance decisions. Deploy only with synthetic data until these are implemented.
- **Currency conversion and cross-country pay-equity conclusions:** exchange rates, dates, local pay bands, and comparable job levels are not specified. Present amounts in their recorded currencies; avoid misleading global totals or rankings.
- **Bulk spreadsheet import/export and employee lifecycle/HRIS integration:** defer until source-of-truth, conflict handling, approval, and data-retention rules are agreed.
- **Compensation approvals, promotions, and historical salary changes:** the initial workflow manages the current annual base salary only; effective dates, approvals, and history need explicit policy.

## Product and engineering assumptions
Salary is an annual base amount represented as a decimal plus an ISO currency code. Each employee has one current salary, department, and country. Demo names and records are synthetic. For production, require SSO, least-privilege access, audited changes, backups, monitoring, and privacy/security review before loading real compensation data.
