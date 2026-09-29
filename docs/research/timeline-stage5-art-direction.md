# Stage 5 — второй visual/art-direction pass

## Решение до реализации

Первый pass технически прошёл проверки, но визуальная концепция не утверждена. Второй pass меняет presentation Timeline index и Homepage preview. Historical JSON, production featured и Timeline detail pages сохраняются.

Landmark — отдельная настройка по stable event ID, а не новый historical flag:

| ID                     | Причина visual stop                                    |
| ---------------------- | ------------------------------------------------------ |
| invasion-neman         | Начало кампании                                        |
| borodino               | Генеральное сражение                                   |
| council-fili           | Решение оставить Москву и сохранить армию              |
| napoleon-leaves-moscow | Переход к отступлению                                  |
| maloyaroslavets        | Выбор направления отступления                          |
| manifest-end-war       | Завершение войны; заключительная типографическая пауза |

## Local inventory и mapping

Проверены public/images, Dictionary production MediaAsset RU/EN, heroSlides, media-manifest.json и dictionary-media-manifest.json. Локально доступны 18 Dictionary файлов и три Timeline/hero файла. Manifest содержит approved Places targets, но соответствующих локальных файлов нет. Modern Places photos и портреты не подменяют изображения событий. Ничего не скачивается, runtime не импортирует editorial manifest.

| Timeline ID            | Approved local asset                                 | Metadata берутся из Dictionary |
| ---------------------- | ---------------------------------------------------- | ------------------------------ |
| smolensk               | /images/dictionary/smolensk-langlois-1839.png        | smolensk-battle                |
| borodino               | /images/timeline/borodino-hess-1843.jpg              | borodino-battle                |
| council-fili           | /images/timeline/fili-council-kivshenko-1882.jpg     | military-council-fili          |
| moscow-fire            | /images/dictionary/moscow-fire-smirnov-1813.jpg      | moscow-fire                    |
| tarutino-battle        | /images/dictionary/tarutino-hess-1847.jpg            | tarutino-maneuver              |
| napoleon-leaves-moscow | /images/timeline/retreat-moscow-suchodolski-1853.jpg | patriotic-war-1812             |
| maloyaroslavets        | /images/dictionary/maloyaroslavets-samokish.jpg      | maloyaroslavets                |
| berezina               | /images/dictionary/berezina-hess.jpg                 | berezina                       |

Все восемь — художественные изображения. Существующие caption/description/credit/source сохраняются; пожар дополнительно получает существующую локализованную формулировку о позднейшем художественном изображении. Тарутино сопоставлено именно с battle, не march. Картина Березины подписана 17 (29) ноября; она иллюстрирует эпизод переправы, а не каждый день диапазона события 14–16 (26–28) ноября. Полотно Суходольского — позднейшее изображение отступления, не документ выхода из Москвы в конкретный день.

Без image: invasion-neman, vilna, armies-unite-smolensk, kutuzov-command, shevardino, moscow-abandoned, tarutino-march, vyazma, krasny, napoleon-leaves-army, liberation-russia, manifest-end-war.

Stage 5 IN PROGRESS. Stage 6 NOT STARTED.

## Проверка второго pass

Повторная проверка 29 сентября: устранена конкуренция focus и pointerenter на Homepage. При Home/End или стрелках прокрутка может переместить другую точку под неподвижный курсор; такой pointerenter больше не отменяет клавиатурный выбор. Движение указателя снова выбирает событие. Проверено для RU и EN.

Dev и static output проверены для Timeline и Homepage: RU 390/768/1440, EN 390/1440. На Timeline все 20 IDs в исходном порядке; 4 regular / 10 featured / 6 landmark, восемь artwork, четыре диапазона дат. На каждой title link виден focus, touch target ≥44 px. Все изображения декодируются и используют contain. Captions/source links присутствуют в обеих локалях. Viewer для каждого из восьми artwork открыт/закрыт; Tab остаётся внутри, Escape возвращает focus, single-image arrows/counter скрыты; wheel zoom и drag/pan проверены на desktop. Touch 390: выбор Homepage event и открытие artwork работают.

Homepage: все шесть точек переключаются по focus/click/tap; ArrowLeft/Right с wrap, Home/End, Enter и CTA проверены. Hover переключает artwork; autoplay отсутствует. Reduced motion отключает fade. На обеих страницах horizontal page overflow отсутствует. Runtime/page errors не обнаружены. На первом запросе к static server браузер получил существующий favicon.ico 404; ресурс отсутствовал до этого pass и не добавлялся. Неблокирующие диагностические Nuxt timer warnings сохранены.

Quality gates: tests **17/17**, typecheck, lint, Prettier всех изменённых файлов, build и generate **PASS**. Prerender — 277 routes. Static HTML RU/EN содержит по 20 events, 8 artwork, 6 Homepage points, все исходные 48 date fields; 40 detail HTML файлов сохранены. SHA-256 Timeline/Dictionary/source JSON RU/EN и Timeline detail template до/после совпадает. Dependencies не добавлялись.
