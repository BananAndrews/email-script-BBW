# General contractor email tool

`sendEmailsToContractors.gs` is a Google Apps Script tool reading the Emails/contractor data to send area-targeted personalized messages. `sendEmailsToContractors()` performs the actual campaign send; `sendPreviewEmail()` sends previews to the executing sender; `showSendReport_()` reports failures. The README is only a short label.

- This is a general email composer, distinct from project broadcasts in `../Main-code-BBW`, recruiting in `../creative-outreach` and timed assignment/reminder notifications.
- The shared Bookings menu in `../Main-code-BBW` references these functions. Preserve their public names unless all consumers are changed together; avoid conflicting Apps Script globals.
- Preserve the confirmation-column filtering, area matching, multiple-recipient handling, personalization, optional signature and per-recipient error reporting.
- A preview sends real email; it is not a passive local check. Do not send mail as part of inspection or onboarding.
- No local automated tests or deployment manifest are documented. For a code change, inspect the sheet schema and validate against a controlled message/recipient setup before any campaign send.
- Do not copy recipient lists, email addresses or message bodies into general workspace context.

When working in `D:\Dev`, consult `../workspace-context/PROJECTS.md` for workspace routing and `../workspace-context/WORKSPACE_CONTEXT.md` for shared context if present. These workspace files are local context, not a dependency of the project. Record material schema/consumer changes in these notes.
