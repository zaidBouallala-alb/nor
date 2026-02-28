# QA Checklist - Offline Storage & Architecture

### Required Manual Checks
1. [ ] **Focus Rings (A11y)**: Tab through interactive elements; verify `focus-visible:ring-2 focus-visible:ring-emerald-500` applies correctly and visibly across Arabic RTL layouts.
2. [ ] **Screen Readers (A11y)**: Ensure `aria-live="polite"` handles dynamic data switching gracefully when transitioning between "live fetch" and offline "IndexedDB" cache.
3. [ ] **Graceful Degradation**: Open app in Private/Incognito mode or environments with `quota=0`. Verify the UI does not crash or block when `idb.js` fails to write.
4. [ ] **Performance (Quran Load)**: Verify the async parsing and loading of the `1.6MB` Quran JSON does not block the main thread. Test lazy/dynamic imports in the service layer.
5. [ ] **Hook Relocation**: Validate `useNextPrayerCountdown` functions properly on `HomePage` and `PrayerTimesPage` via its new `/hooks` directory.
6. [ ] **IDB Store Schema**: Verify DevTools > Application > IndexedDB displays `NoorAppDB` with exact store names: `app_cache` and `user_data`.
7. [ ] **Storage Write**: Test tasbih or bookmark actions. Confirm data saves exclusively to the `user_data` store via services.
8. [ ] **Storage Read**: Turn off network. Check if prayers/Athkar populate seamlessly from the `app_cache` store.
9. [ ] **Browser Support**: Run `isIdbSupported()` in environments masking IDB (e.g., specific mobile web-views). Expect safe fallbacks.
10. [ ] **UI Rendering**: Confirm text formatting remains correct in Arabic. Example placeholder verification: `[AYAH_TEXT]` should not break layout wrappers.

### Additional A11y Checks
11. [ ] **Keyboard Navigation**: Verify TAB traversal flows naturally in Arabic RTL layout (Right-to-Left source ordering). Focus states must clearly jump in visually correct sequence.
12. [ ] **Accordion Escape**: Open an Athkar category accordion and press the `Escape` key. It must collapse instantly and return focus to its trigger button.
13. [ ] **Live Regions**: When clicking filtering tabs (e.g., "All", "Completed") or loading network states, verify screen readers announce the newly injected DOM arrays via `aria-live="polite"` configurations.
