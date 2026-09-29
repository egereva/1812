# Stage 5 — Homepage Timeline targeted refinement

2026-09-29. **Stage 5 IN PROGRESS / Stage 6 NOT STARTED.** Этот pass меняет Homepage preview и default-locale behaviour. Timeline index/detail, historical entity content, production featured, Dictionary и Hero сохранены.

## Curated subset и media

Homepage image coverage: **6/6**. Production chronology определяет порядок независимого Homepage subset. manifest-end-war остаётся landmark полного Timeline; его отсутствие в preview не меняет production данные или full presentation.

| Event ID               | Approved local asset                                 |
| ---------------------- | ---------------------------------------------------- |
| invasion-neman         | /images/timeline/crossing-neman-clark-1816.jpg       |
| borodino               | /images/timeline/borodino-hess-1843.jpg              |
| council-fili           | /images/timeline/fili-council-kivshenko-1882.jpg     |
| napoleon-leaves-moscow | /images/timeline/retreat-moscow-suchodolski-1853.jpg |
| maloyaroslavets        | /images/dictionary/maloyaroslavets-samokish.jpg      |
| berezina               | /images/dictionary/berezina-hess.jpg                 |

Все existing paths проверены, дубликаты не созданы. Для финального Homepage subset missing media нет. manifest-end-war по-прежнему без изображения на полной Timeline; новый media research после интеграции Немана не проводился. Предыдущий refinement имел coverage 4/6 и два missing slots; текущий curated decision и approved Neman original закрывают Homepage boundary.

Новый asset: John Heaviside Clark и M. Dubourg, _The boasted crossing of the Niemen, at the opening of the campaign in 1812, by Napoleon Bonaparte_, 1816. [Commons file page](https://commons.wikimedia.org/wiki/File:Crossing_the_Neman_in_Russia_1812_by_Clark.jpg) проверена: public domain / PD-Art / Public Domain Mark 1.0. Загружен original JPEG, 978×709, 198303 bytes, SHA-1 41c427a2e78712ebd514be06bacfde10b70100bb, совпадает с Commons. Изображение просмотрено после загрузки. Localized alt/caption/credit находятся в Homepage presentation config; src-media-neman-clark-1816 добавлен как media record в обоих sources.json. docs/research/media-manifest.json содержит editorial provenance; runtime его не импортирует. Caption явно обозначает позднейшее художественное изображение.

## Presentation

Desktop >1024 px сохраняет dark environment, heading/intro, шесть точек horizontal axis и CTA. Active composition: примерно 52% text / 48% art, gap 48 px. Artwork целиком, object-fit contain, разумная max height, normalized caption и quiet attribution/source. Уходящая composition inert/aria-hidden; fade 160 ms, reduced motion — instant. Full old-style date range Березины показывается как 14–16 ноября 1812 года, без calendar conversion. Все точки доступны hover/focus/click и ArrowLeft/Right/Home/End. Missing local image даёт text composition без placeholder.

Mobile/tablet ≤1024 px: отдельная semantic ordered list, native overflow-x auto, scroll-snap-type x mandatory, скрытый scrollbar. На 390 item занимает 85% strip, виден следующий; на 768 — 44%, видна часть третьего. Artwork/date/short title образуют одну прямую detail link. Caption/source под ссылкой, CTA отдельно. Tab фокусирует и прокручивает item в видимую область. Desktop controls скрыты, библиотека/carousel/autoplay/JS drag отсутствуют. Section counter не возвращён.

## Locale contract

defaultLocale ru, prefix_except_default, detectBrowserLanguage false. URL authoritative: /, /timeline, /dictionary и остальные unprefixed routes RU; /en и /en/... EN. Browser language, navigator, Accept-Language и stale i18n_redirected=en cookie не переопределяют URL. Ручной RU/EN switch использует прежний equivalent localized route.

## Verification

Проверка на dev и final static output: RU/EN 390 / 768 / 1440. Desktop audit включает все шесть состояний в обеих локалях, корректные date/title/description/detail target/artwork/caption/source, contain и split. Все 12 artwork openings проверяют общий viewer, Tab trap, Escape и focus return. Проверяются hover/focus/click, Home/End/ArrowLeft/Right и reduced motion; runtime errors отсутствуют.

Mobile/tablet audit: 6/6 images, semantic links с alt, native swipe, snap alignment с scroll padding 8 px, next-item peek, отсутствие horizontal page overflow. Реальный Tab проходит все шесть event links, включая после source links; focus solid, focused item полностью виден, touch targets >44 px. Один tap открывает localized detail. На 768 desktop split скрыт, strip остаётся естественным по ширине. RU/EN parity проверена тестами и browser audit.

Locale audit использует fresh browser context с navigator.language=en-US, Accept-Language: en-US,en;q=0.9 и stale EN cookie. Direct /, /timeline, /dictionary, /map, /about, /sources и detail routes остаются RU; /en, /en/timeline, /en/dictionary EN. Ручной switch в обе стороны сохраняет detail route.

Final static recheck: RU/EN 390/768/1440 PASS, все шесть desktop artwork/date/metadata states и viewer focus return, strip images/peek/snap/overflow PASS. Native touch swipe в обеих локалях на dev завершился snap к Бородину при scrollLeft 302.4 px; один tap открыл detail. Static default-locale audit с EN browser/header/cookie и equivalent detail switch в обе стороны PASS.

Quality gates: tests **18/18**, typecheck, lint, Prettier всех changed files, build и generate **PASS**; **277 prerendered routes**. Новая regression проверка подтверждает curated order, six local artworks/source records и original SHA-1. SHA-256 полного Timeline index/detail и обоих Timeline JSON совпадает с началом этого pass. Existing source records сохранены, добавлен только новый media source в обеих локалях. Dependencies не добавлены. Runtime/console errors 0; существующие Nuxt diagnostic timer/deprecation warnings остаются вне scope. Homepage refinement выполнен; Stage 5 остаётся IN PROGRESS.

## Targeted initial-artwork bugfix

Первоначальный active ID ошибочно оставался borodino. Дополнительный Homepage runtime whitelist мог вернуть undefined для approved Neman slot, если runtime snapshot не содержал новый путь. Предыдущий content test проверял файл и metadata отдельным lookup, обходя resolver компонента. В сохранённом свежем предыдущем generated output путь Немана уже присутствовал; устаревший whitelist именно в экземпляре пользователя не подтверждён.

Homepage теперь использует единый getHomepageTimelineEvents для component и regression tests, без второго runtime filter, initial ID invasion-neman. Full Timeline resolver и дизайн не меняются. Новый post-generate test читает фактический HTML active region и шесть strip items RU/EN; на прежнем output оба теста падают из-за initial borodino.

Final generated app: direct open и hard reload / и /en показывают Неман до любого выбора события; SSR без JavaScript и hydrated client совпадают. JPEG HTTP 200, natural size 978×709, desktop rendered size примерно 601×436 px, contain и caption/source visible. RU/EN 1440: все шесть active states с реальным видимым img, декодированным binary и metadata — PASS, visible coverage **6/6**. RU/EN 390/768: первый strip item содержит видимое изображение Немана, approved composition сохранена; page overflow отсутствует. Runtime errors 0. Content tests **18/18**, generated markup regression **2/2**, typecheck, lint, format, build и generate PASS; 277 routes. Full Timeline index/detail и production Timeline JSON hashes сохранены. Stage 5 IN PROGRESS / Stage 6 NOT STARTED.
