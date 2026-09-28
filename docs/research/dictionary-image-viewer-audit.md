# Dictionary image detail viewer — 2026-09-28

PhotoSwipe 5.4.4 — единственная новая dependency. Перед установкой стабильная версия проверена через `npm view photoswipe version peerDependencies dependencies --json` и [официальную документацию](https://photoswipe.com/getting-started/); v6 находится в разработке. Core — framework-independent ESM, без зависимости от Vue. Nuxt 4/Vue 3 проверены локальными typecheck и static generate; JS импортируется только при клиентском открытии.

Общий `MuseumImage` принимает `image`, необязательный `images` и `index`. Сейчас используется в Dictionary; остальные разделы не подключены. Trigger — SSR button с локальным img, aria-label, zoom-in cursor и минимальной иконкой на hover/focus. Viewer — графитовый фон #252628, светлые тонкие controls 44×44 px, contain без обрезки при начальном вписывании; при zoom работает pan. Предельный zoom — исходное разрешение. Маленькие originals не получают бесполезную zoom-кнопку.

Caption/description/credit/source берутся из существующих локализованных данных. Rights/license остаются частью имеющегося credit. Metadata отделены от области artwork, их высота измеряется с учётом safe-area. Длинная caption прокручивается в ограниченной нижней панели. Content JSON, IDs, sourceIds, filenames и binaries не менялись.

## Browser audit

- Bagration portrait RU и Borodino artwork RU: 1440×844 и 390×844; дополнительно Bagration EN 390×844.
- Click, Enter и Space открывают; close button, Esc, click/tap outside закрывают. Focus возвращается к trigger, background inert и scroll lock снимаются.
- Tab/Shift+Tab остаются в dialog; focus заметен. Wheel zoom и mouse drag/pan меняют transform. Pinch zoom и touch pan проверены через Chrome touch emulation/CDP в контексте 390×844 с `hasTouch`/`isMobile`.
- Original aspect ratio сохранён; artwork не перекрывает metadata; horizontal overflow — 0. Для одного asset нет prev/next и 1/1.
- Маленький original Kutuzov/Basin: zoom-кнопка скрыта на 1440.
- Массив из двух assets и длинная caption проверены временными browser props без изменения production content: ArrowRight → 2/2, ArrowLeft → 1/2; две стрелки; длинная caption прокручивается, artwork остаётся отдельно.
- `prefers-reduced-motion: reduce`: open/close/zoom duration 0, backdrop transition 0s.

## Quality gates

- Tests: 13/13 PASS.
- Typecheck, lint, Prettier изменённых файлов: PASS.
- Static generate: PASS; 277 routes, 58 Dictionary detail HTML, 190 абзацев, 46 страниц с image. Trigger и image присутствуют в SSR output, overlay отсутствует до пользовательского открытия.
- Viewer проверен также из static output на desktop/mobile; импортируется отдельный PhotoSwipe chunk. Browser console errors — 0.

Image viewer task завершён. На момент этого промежуточного audit Stage 4 оставался IN PROGRESS. При финализации modal preview статьи намеренно исключён из scope; Stage 4 COMPLETE, Stage 5 NOT STARTED — см. [final audit](dictionary-stage4-final-audit.md).
