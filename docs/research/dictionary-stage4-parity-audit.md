# Stage 4 Dictionary corrective pass — 2026-09-28

Текущий [parity manifest](dictionary-media-manifest.parity.json) заменяет первый Dictionary manifest для этого pass. Исторические данные RU не переписаны: 29 статей, 95 абзацев. EN shortDescription/content[] локализованы с сохранением 95 абзацев, фактов и оговорок. ID, slug, title, letter, category и relations EN сохранены; sourceIds соответствуют утверждённым RU.

## Медиа

- Скачано и визуально проверено 18 approved-new оригиналов с утверждённых sourcePage.
- Пять reuse-approved назначений используют три уже существовавших локальных файла; дубликаты не создавались.
- В каждой локали 23 image object, всего 21 уникальный local asset.
- RU/EN src и sourceId совпадают. Alt/caption локализованы; EN не содержит скопированного русского текста. Позднейшие картины имеют соответствующие подписи/оговорки.
- В каждой локали добавлен 21 source record типа media с реальными Commons URL. Первоначальные 25 исторических источников и sourceIds статей не изменены.
- Для Раевского выбран [портрет Доу генерала 1771–1829 годов](https://commons.wikimedia.org/wiki/File:Rajevskij_N_N.jpg), связанный непосредственно с утверждённой категорией. Миниатюра неизвестного художника не использовалась. Source record указывает конкретную file page.
- Original Багратиона скачан повторно с той же страницы после первого таймаута; итоговых ошибок скачивания для интегрированных файлов нет.
- Оригиналы Kutuzov/Basin (237×388) и Roubaud/photo (265×265) имеют небольшое исходное разрешение; другие файлы вместо них не подбирались. Фрагмент панорамы имеет собственную широкую пропорцию 3764×340; изображение не обрезается.

## Закрытые media items: Napoleon / Alexander I

Оба портрета подключены синхронно RU/EN по явному запросу редактора. Автор, произведение, дата и Public Domain / PD-Art сверены с фактическими Commons-карточками; конфликтующие metadata исправлены в текущем parity manifest. Локальные оригиналы: Napoleon 569×950, Alexander I 1127×1650. Alt/caption локализованы, source records добавлены в обе локали. Остальные 21 image object и исторические поля всех 29 статей каждой локали сохранены без изменений относительно начала этого visual/media pass.

| Entry       | Manifest                                 | Данные указанного sourcePage                                                                                                                                                                                    | Подготовленная корректировка RU/EN                                                                                                                                           |
| ----------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| napoleon    | after François Gérard / historical print | [Jacques-Louis David, The Emperor Napoleon in His Study at the Tuileries, 1812](https://commons.wikimedia.org/wiki/File:Napoleon_Bonaparte_gg.jpg); страница перенаправляет на File:Napoleon Bonaparte 1812.jpg | Жак-Луи Давид / Jacques-Louis David; «Наполеон в своём кабинете в Тюильри», 1812 / The Emperor Napoleon in His Study at the Tuileries, 1812; тип painting, не portrait-print |
| alexander-i | c. 1818–1825                             | [George Dawe, Alexander I, RCIN 400570, 1817](<https://commons.wikimedia.org/wiki/File:George_Dawe_(1781-1829)_-_Alexander_I,_Emperor_of_Russia_(1777-1825)_-_RCIN_400570_-_Royal_Collection.jpg>)              | Джордж Доу. Портрет императора Александра I, 1817 / George Dawe. Portrait of Emperor Alexander I, 1817                                                                       |

Намеренные no-image-yet: dorogomilovo, moscow-militia, partisan-movement, poklonnaya-hill, smolensk-road, triumphal-arch. Без image остаются шесть статей. Placeholder отсутствует у всех.

## Проверки

- Existing content/parity validator: PASS; broken sourceIds/relations = 0.
- Tests: 13/13 PASS. Новый тест проверяет 95 абзацев обеих локалей, совпадение paragraph boundaries, локальные image paths, src/source identity и отсутствие image у no-image-yet.
- Typecheck, lint: PASS. Prettier изменённых Vue/JSON/test файлов: PASS; unrelated formatting deviations не исправлялись.
- Static generate: PASS, 277 prerender routes. Все 58 dictionary detail HTML проверены: присутствуют 190 из 190 абзацев, 46 страниц содержат подключённые image, файлы доступны в output.
- Corrective visual audit: Bagration RU 1440/390, Napoleon RU 1440/390, Borodino battle RU 1440, Dorogomilovo RU 1440, Barclay de Tolly EN 1440/390; дополнительно Alexander I RU 1440. Статья визуально главнее image; портреты ограничены 28rem, artwork не обрезан; captions не расширяют колонку; длинные H1 не конфликтуют с layout. Desktop H1 уменьшен с 5.5vw до 4.8vw (~13%).
- EN representative person/event/no-image: Bagration, Borodino battle, Dorogomilovo на 390/1440.
- Те же representative страницы открыты из статического output: HTTP 200, image loaded, no horizontal overflow.
- Визуально проверены portrait/landscape, читаемые caption/credit, мобильный порядок и отсутствие пустой колонки. Keyboard Tab достигает ссылки на источник image с видимым focus; Enter работает на алфавите, мобильное меню открывается с клавиатуры, Escape возвращает focus кнопке.
- Console errors: 0. В статическом QA присутствовали предупреждения Nuxt debug timers; они не относятся к Dictionary layout.

На момент этого промежуточного audit Stage 4 оставался IN PROGRESS. При финализации modal preview намеренно исключён из scope как дублирование detail UX; Stage 4 COMPLETE, Stage 5 NOT STARTED — см. [final audit](dictionary-stage4-final-audit.md). Stage 8 не начинался.
