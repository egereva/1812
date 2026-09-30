# Stage 5 — Timeline final audit, 2026-09-30

**Stage 5 COMPLETE. Stage 6 NOT STARTED.** Финальная приёмка выполнена на generated static output после последней локальной полировки detail page. Исторический контент, production media, Homepage, полный Timeline index, Dictionary, Hero и общий image viewer не изменялись.

## Финальная полировка detail

- Вторичная дата получила видимый разделитель `·` перед локализованной подписью нового стиля; supplied date fields и calendar logic не изменены.
- Desktop article text увеличен примерно на 1 px; при ширине до 900 px сохранён прежний размер.
- На 390 px сокращён только вертикальный интервал related items; ссылки имеют минимальную высоту 44 px.

## Данные и media

| Проверка                                       |      RU |      EN | Результат |
| ---------------------------------------------- | ------: | ------: | --------- |
| Timeline events / article paragraphs           | 20 / 60 | 20 / 60 | PASS      |
| Detail artworks, decoded and visible           |   17/20 |   17/20 | PASS      |
| No-image detail pages without empty media slot |       3 |       3 | PASS      |
| Generated detail pages                         |      20 |      20 | PASS      |

Content tests подтвердили RU/EN parity ID и slug, стабильность утверждённых полей, сортировку по `sortDate`, даты и диапазоны, связи, `sourceIds`, локальные media paths и metadata. У всех 17 изображений на локаль есть доступный файл, alt, caption, attribution и source; несуществующие изображения для трёх оставшихся событий не подставлялись. Отдельно проверены контекстные квалификации: Krasny — ноябрьский Losmina, Vilna — вид города, Kutuzov — портрет, Shevardino — современная документальная фотография, Tarutino — контекстная карта. Поздние художественные произведения обозначены как созданные после событий.

## Generated site и визуальная проверка

- Все 40 detail URL отвечают из static output: по одному H1 и три production абзаца, локализованные title/description, supplied даты и диапазоны, изображения/caption/source там, где назначены, related materials, historical sources и chronological previous/next. Первая и последняя статьи имеют по одному соседу. Прямое открытие с выключенным JavaScript сохраняет содержимое и ссылки; клиентская навигация и переключение локали также проверены.
- Detail: RU — Borodino, Berezina, Manifesto на 390/768/1440; Kutuzov и Tarutino на 1440. EN — Borodino, Berezina, Manifesto на 390/1440. Все 20 detail pages каждой локали дополнительно просмотрены на 1440. Изображения декодируются и занимают предусмотренный media slot, нет горизонтального overflow, коллизий текста или пустого зазора перед footer.
- Homepage: direct open и hard reload `/` и `/en` сразу показывают `invasion-neman` с декодированным artwork. На desktop последовательно проверены все шесть active states: **видимый artwork 6/6** в RU и EN. На 390 и 768 первый элемент horizontal strip с Неманом и все шесть strip images реально видимы/декодируются. RU/EN 390/768/1440 PASS.
- `/timeline` и `/en/timeline`: ровно 20 событий в production chronology, presentation tiers 6 landmark / 10 featured / 4 regular, все восемь назначенных index images декодируются на обеих локалях; 390/768/1440 без overflow.
- Viewer: keyboard Enter, Tab trap, Escape, возврат фокуса, заметный focus, touch open/close и pinch zoom, reduced motion — PASS. Source links разрешаются; browser runtime exceptions и hydration mismatches — 0. Отдельный существующий favicon 404 и диагностические Nuxt timing warnings не относятся к Timeline.

Контрольные screenshots generated static output сохранены в `.playwright-mcp/timeline-stage5-final/`: RU Borodino 390, Berezina 768, Manifesto 1440; EN Borodino 1440, Berezina 390, Manifesto 390.

## Quality gates и границы изменений

`npm test` **19/19**, generated detail render **40/40**, generated Homepage render **2/2**, typecheck, lint, полный format check, build и generate — **PASS**. Generate создал **277 routes**. SHA-256 сравнение 28 замороженных content/media/presentation/viewer paths с состоянием до финальной полировки: **0 изменений**.

Изменены только `app/pages/timeline/[slug].vue`, проверка rendered вторичной даты в `test/timeline-detail-render.test.mjs`, этот отчёт и текущий статус в `docs/ROADMAP.md`. Предыдущие отчёты сохраняют статус этапа на момент соответствующих промежуточных проходов.
