# Changelog

All notable changes to HealthMate will be documented in this file.

## [v5.0.0] - 2026-04-29
### Added
- Complete Offline PWA support with `vite-plugin-pwa`
- New i18n support for English and Chinese via `react-i18next`
- Native app installation prompt experience
- Pro features and access gate system
- End-to-end encryption guidelines added to architectural docs
- Accessibility improvements (screen reader support in drawers and dialogs)

### Fixed
- Fixed bug causing `DialogContent` to miss title attributes inside Drawer
- Fixed layout shift when rendering Markdown dynamically in results page

## [v4.0.0] - Early 2026
### Added
- Proactive AI Watchdog module (Cron triggers and scheduled anomaly checks)
- Anomaly alerts and predictive medication expiration dates
- Agent tools expanded to over 35 items
- Integration with node-mailer for weekly health reports

## [v3.0.0] - Late 2025
### Added
- Voice-to-text dictation integrated into Visit Diary module
- Three-tier RAG capability allowing cross-referencing between reports, diaries, and global medical knowledge
- Ollama local endpoint integration for maximum privacy

## [v2.0.0] - Mid 2025
### Added
- Full-stack transition to Vite + Express + SQLite
- User authentication and multi-member family profile management
- V1 to V2 automated migration procedure

## [v1.0.0] - Early 2025
### Added
- Initial release
- OCR laboratory report parsing and indicator extraction
- Basic AI interpretations and severity assessments
- Local storage (IndexedDB) mechanism
