# Stage 4 — Dictionary: final audit, 2026-09-28

**Stage 4 COMPLETE. Stage 5 NOT STARTED.** Новая функциональность и visual redesign при финализации не добавлялись. Исторический контент, sources.json и media binaries сохранены; контрольные SHA-256 Dictionary/source JSON до и после финального audit совпадают.

## Принятое изменение UX

Первоначально запланированный Dictionary modal preview **intentionally removed from scope** по решению редактора. Полноценные detail pages теперь являются основным просмотром записи. Дополнительный modal дублировал бы detail UX и создавал лишний промежуточный уровень. Это осознанное изменение первоначального сценария, а не незавершённая или отложенная задача. Homepage preview и index ведут сразу на detail. Museum Image Viewer / PhotoSwipe сохраняется: он увеличивает изображение, а не заменяет статью.

## Content и parity

| Проверка                    | RU      | EN      |
| --------------------------- | ------- | ------- |
| Dictionary entries          | 29      | 29      |
| Content paragraphs          | 95      | 95      |
| Unique id / slug            | 29 / 29 | 29 / 29 |
| Entries with image          | 23      | 23      |
| Intentionally without image | 6       | 6       |

Структурный RU/EN parity и число абзацев каждой пары PASS. Неизвестных sourceIds, неразрешённых relations и catalog problems — 0. Локализованные заголовки/тексты сохраняются, EN не подменяется RU. Article sources и media sources разделены.

## Media

23 назначения на локаль используют 21 уникальный локальный asset: 18 новых approved originals и 5 reuse-approved назначений на 3 существующих файла. Napoleon и Alexander I подключены в RU/EN с проверенными ранее metadata (David, 1812 / Dawe, 1817).

Без image намеренно остаются `dorogomilovo`, `moscow-militia`, `partisan-movement`, `poklonnaya-hill`, `smolensk-road`, `triumphal-arch`. Их страницы полны без placeholder и пустой колонки; это допустимое финальное состояние Stage 4.

Все локальные files существуют и загружаются в static output. Alt/caption локализованы; credit/license и Commons source URL присутствуют. Inline и viewer используют одну нормализованную presentation: caption с существующим пояснением, затем тихая attribution со встроенной ссылкой source. Повтор автора убирается только при показе; неизвестный фотограф и оговорка о контексте Шевардинского редута сохраняются. Никаких выдуманных metadata.

## Routes и navigation

Static generate PASS: **277 routes**, включая **58 Dictionary detail HTML**, 190 отрендеренных content paragraphs и 46 страниц с image. Все абзацы в HTML совпадают с JSON. SSR содержит image/trigger; overlay появляется только после открытия.

На локально обслуживаемом `.output/public` все 29 RU и 29 EN detail URL проверены напрямую с HTTP 200 на каждой ширине 390 / 768 / 1440 (174 detail посещения). Оба index и homepage также проверены. В index по 29 уникальных detail links; homepage содержит 4 detail links, 4 letter links и переход в index на локаль, все отвечают HTTP 200. Все letter anchors ведут в непустые группы (RU 14 / EN 12), пустые буквы не создают ссылки. Enter открывает detail; back возвращает в index. RU ↔ EN переключатель сохраняет выбранную запись на всех трёх ширинах.

## Accessibility и responsive

- RU/EN: homepage, alphabet/index и все detail pages проверены на 390 / 768 / 1440. Один H1 на detail; horizontal overflow и overflow captions — 0. Portrait сохраняет пропорции и ограничение высоты; landscape вписывается целиком; no-image layout без пустой колонки. Дополнительно просмотрены screenshots длинного EN H1 на 768 и landscape viewer на 390.
- Bagration portrait и Borodino landscape viewer: обе локали, все три ширины. Enter/Space открывают; Esc, close button и outside click закрывают; focus возвращается к trigger; background inert/scroll lock снимаются. Tab/Shift+Tab удерживаются в dialog, focus виден; controls не меньше 44×44 px.
- Wheel zoom и drag/pan PASS на 390/1440 в RU/EN. Pinch и touch pan подтверждены Chrome touch emulation/CDP на 390. Начальное aspect ratio/contain сохранено; metadata не перекрывает artwork. Один image без prev/next и counter.
- Reduced motion: alphabet использует instant scroll; viewer transitions 0s на 768 в RU/EN. Перепроверено на статической сборке.
- Browser runtime errors — 0. Проверка выполнена в Chromium; физические мобильные устройства в этот audit не входили.

## Quality gates

Tests **15/15**, typecheck, lint, полный `npm run format:check`, `npm run build`, `npm run generate` — **PASS**. Пять существовавших format deviations исправлены только Prettier, без изменения поведения. Generate/SSR не требуют загрузки browser-only PhotoSwipe core.

Sandbox блокировал запуск esbuild (`spawn EPERM`); build/generate успешно повторены с разрешённым запуском дочернего процесса. В Nuxt остаются неблокирующие warnings диагностических `console.time` labels (включая prerender и client navigation); failed routes и browser runtime errors отсутствуют. Это не Stage 4 regression; диагностика Nuxt не изменялась.

Stage 4 blockers — **0**. Stage 5, Places/Timeline viewer integration и related sections не начинались.
