# Stage 5 — Timeline detail media integration

2026-09-29. Input: approved `1812-timeline-detail-enrichment.zip`, its
`timeline-media-plan.json`, README and RESEARCH; latest user scope takes priority.
No additional subject research or substitute imagery was introduced.

## Result

**Production media coverage: RU 17/20; EN 17/20.** Ten existing binaries reused,
seven new verified originals stored locally. Three events remain unresolved.
Both locales reference the same file and media source ID, with localized alt,
caption, description and credit. Historical fields, including all 60 paragraphs
per locale, dates, flags, relations and historical sourceIds, are unchanged.

This is preparation of the existing `TimelineEvent.image` field. The current
detail template still displays the title and shortDescription; it does not render
image or expanded content. Coverage here means verified production media,
**not 17 visible detail-page images**. Homepage and full Timeline presentation
resolvers/templates were not changed. The full index retains its existing eight
Dictionary-derived artworks. Detail redesign belongs to a separate pass.

Paths below are relative to `public/images/`.

| Event ID               | Actual asset                                 | Status                                           |
| ---------------------- | -------------------------------------------- | ------------------------------------------------ |
| invasion-neman         | timeline/crossing-neman-clark-1816.jpg       | Reused                                           |
| vilna                  | timeline/vilna-cui-attributed-1812.jpg       | New; contextual city view                        |
| armies-unite-smolensk  | —                                            | Unresolved; original download unavailable        |
| smolensk               | dictionary/smolensk-langlois-1839.png        | Reused                                           |
| kutuzov-command        | dictionary/kutuzov-basin.jpg                 | Reused; contextual portrait                      |
| shevardino             | timeline/shevardino-redoubt-tuzanna-2020.jpg | New; modern documentary photograph               |
| borodino               | timeline/borodino-hess-1843.jpg              | Reused                                           |
| council-fili           | timeline/fili-council-kivshenko-1882.jpg     | Reused                                           |
| moscow-abandoned       | timeline/moscow-entry-basset-1812.jpg        | New; French entry, rather than Russian departure |
| moscow-fire            | dictionary/moscow-fire-smirnov-1813.jpg      | Reused                                           |
| tarutino-march         | timeline/tarutino-maneuver-kaidor-2018.svg   | New; modern historical map                       |
| tarutino-battle        | dictionary/tarutino-hess-1847.jpg            | Reused                                           |
| napoleon-leaves-moscow | timeline/retreat-moscow-suchodolski-1853.jpg | Reused                                           |
| maloyaroslavets        | dictionary/maloyaroslavets-samokish.jpg      | Reused                                           |
| vyazma                 | timeline/vyazma-hess.jpg                     | New; later artwork                               |
| krasny                 | timeline/krasny-losmina-hess.jpg             | New; November Losmina fighting                   |
| berezina               | dictionary/berezina-hess.jpg                 | Reused                                           |
| napoleon-leaves-army   | timeline/smorgoni-samokish-1912.jpg          | New; later engraving                             |
| liberation-russia      | —                                            | Unresolved; original download unavailable        |
| manifest-end-war       | —                                            | Unresolved; exact reusable page scan unverified  |

## Verification and qualifications

Full source pages, original URLs, byte counts, SHA-1, dimensions, licenses and
localized captions for the seven new originals are recorded in
[media-manifest.json](media-manifest.json). Existing Dictionary media metadata
was reused; those binaries were not copied. The general manifest's obsolete
`berezina-hess` target was corrected to the actual approved Dictionary asset.

- **Vilna:** [specified Commons source](<https://commons.wikimedia.org/wiki/File:Vilnia,_Pałacavy-Ludvisarskaja._Вільня,_Палацавы-Людвісарская_(N._Cui,_1812).jpg>)
  dates the view to 1812 and gives **Napoleon Cui (?)**, citing the National Museum
  in Kraków, MNK III-ryc.-41734, and Drėma's _Dingęs Vilnius_ (1991). Attribution
  is explicitly tentative, not converted into certainty. PDM 1.0 / public domain.
  Caption identifies a city view, not the Grande Armée's June entry. The image
  inspection tool produced colour-band artifacts; the unchanged 3123×2178
  original was then decoded and visually checked in Chromium without those
  artifacts. No repair or retouching was performed.
- **Shevardino:** [specified photograph](https://commons.wikimedia.org/wiki/File:Shevardino_Redoubt_1.jpg),
  Tuzanna, 25 July 2020, rear view of the redoubt; CC BY-SA 4.0. Author, license
  URL and unchanged-original wording are present. It is a modern documentary
  view, not a battle scene.
- **Moscow abandoned:** [specified print](https://commons.wikimedia.org/wiki/File:Entrée_de_l'Armée_française_commandée_par_S._M._l'Empereur_Napoléon_dans_la_Ville_de_Moscou_le_14_septembre_1812_-_estampe_-_btv1b69538762.jpg),
  anonymous artist, Basset publisher, BnF De Vinck 8764, PD-France.
  [BnF catalogue](https://catalogue.bnf.fr/ark:/12148/cb41514977q) confirms the
  coloured etching was deposited on 31 October 1812. Caption describes French
  entry on 14 September, not Russian withdrawal. The print's polemical text is
  not adopted as historical narrative.
- **Tarutino march:** [specified map](https://commons.wikimedia.org/wiki/File:Manoeuvre_of_Tarutino_-_ru.svg),
  Kaidor, 2 October 2018, revised 9 February 2019; CC BY-SA 4.0, based on the
  Great Soviet Encyclopedia (1976, vol. 25, p. 283) and OpenStreetMap data (ODbL).
  Credit includes both creator and OpenStreetMap contributors, with license
  URLs. Local original SVG was visually inspected and remains unmodified.
  Localized metadata explicitly notes the map itself has Russian labels.
- **Vyazma:** [specified Commons painting](https://commons.wikimedia.org/wiki/File:Battle_vyazma.jpg)
  identifies Peter von Hess, the 22 October (3 November) battle, Hermitage
  ГЭ-5920 and PD-Art / PDM 1.0. Its creation-date field says 1812, which is not
  accepted as the canvas date: a [museum research publication](https://www.borodino.ru/wp-content/uploads/2023/01/8-Berezin-Bukreeva.pdf),
  pp. 121–122, documents the series commission in 1839 and execution in
  1842–1856. Metadata states nineteenth century and the series period; the
  exact canvas year remains unconfirmed. No precise year was invented.
- **Krasny:** [specified Losmina painting](https://commons.wikimedia.org/wiki/File:Hess-1812losmina.jpg)
  identifies Peter von Hess and **6 (18) November**, an episode of the November
  fighting at Krasny. PD-Art / PDM 1.0. Exact canvas date and collection are not
  established by this file page; metadata records the series period from the
  same museum publication, without inventing an institution or precise year.
  The August `Hess Krasnoy1812.jpg` is excluded. A content test locks the
  November event dates, Losmina asset and source, and caption's November date.
- **Napoleon leaves army:** [specified engraving](<https://commons.wikimedia.org/wiki/File:Наполеон_покидает_армию_в_Сморгони_(гравюра_Н.С._Самокиша).jpg>)
  identifies Nikolai Samokish, circa 1912, published in _Niva_, no. 2 (1912),
  and departure at Smorgoni. PD-old-80-expired / PDM 1.0. Caption explicitly
  identifies a later engraving. Repository event dates are untouched.

## Unresolved candidates

- **armies-unite-smolensk:** the specified
  [Commons category](https://commons.wikimedia.org/wiki/Category:Maps_of_the_French_invasion_of_Russia)
  contains [Sytin's campaign map no. 1](<https://commons.wikimedia.org/wiki/File:Карта-схема_к_статье_«Отечественная_война»_№_1._Военная_энциклопедия_Сытина_(Санкт-Петербург,_1911-1915).jpg>),
  identified as vol. 17, 1914, public domain. Its 8050×5490 original download
  returned HTTP 429. No original was acquired or integrated, and no claim that
  this map's detailed routes are verified is made. No preview substitute.
- **liberation-russia:** the specified
  [Porter/Neele retreat map](https://commons.wikimedia.org/wiki/File:Retreat_of_the_French_Army_from_Moscow_-_to_the_banks_of_the_Neimen_LOC_2015591083.jpg)
  is identified as 1813, Library of Congress G7011.S5 1813 .P7, public domain /
  PD-Art. Its 5708×5203 original returned HTTP 429; the linked Library of Congress
  item/API request returned HTTP 403. No original acquired, no preview or
  substitute integrated. This is a delivery gap, not a conclusion that the
  historical map is unsuitable.
- **manifest-end-war:** [specified Wikisource text](https://ru.wikisource.org/wiki/Высочайший_манифест_25.12.1812_№_1/ДО)
  identifies the 25 December manifesto, PSZRI collection I, vol. XXXII,
  pp. 486–487, no. 25295. The linked
  [Commons volume](https://commons.wikimedia.org/wiki/File:Полное_собрание_законов_Российской_Империи._Собрание_Первое._Том_32.djvu)
  is the 1830 edition, public domain, with a 1135-page DJVU original. The exact
  Wikisource page link for p. 486 returned HTTP 404. A reusable raster of the
  correct document page was not verified. The book's title page or a portrait
  was not substituted; no DJVU or unverified page image was downloaded.

## Checks

- Content/hero tests **19/19 PASS**, including local-file and source integrity,
  RU/EN parity, exact intended reuse, binary checksums and duplicate prevention,
  all six Homepage mappings, and the November Losmina guard. SHA-256 assertions
  protect all approved editorial paragraphs and non-content/non-image historical
  metadata. A pre/post snapshot comparison also confirmed every non-image field
  was unchanged after formatting.
- Post-generate Homepage SSR tests **2/2 PASS**: initial active Neman image,
  source/caption markup and all six horizontal-strip images in both locales.
- Typecheck, lint, changed-file Prettier check, diff whitespace check,
  build and generate **PASS**. Static generation: **277 routes**.
- **17/17** production media files exist in `.output/public`, return HTTP 200
  and image MIME types. All seven new originals decode in Chromium at the
  dimensions recorded in the manifest.
- Generated Homepage, RU/EN **390 and 1440**: actual visible artwork **6/6**
  for both locales, with direct open and reload starting on visible Neman.
  Each desktop state and each horizontally scrolled strip item was checked.
  No page overflow or runtime/console errors; screenshots visually reviewed.
- Generated full Timeline, RU/EN **390 and 1440**: 20 events, eight existing
  rendered artworks decoded and visible, no overflow or runtime/console errors.
  Borodino screenshots reviewed in both locales and widths. No new production
  images were automatically picked up by the unchanged presentation resolver.
- Generated detail samples `invasion-neman`, `borodino`, `krasny`,
  `manifest-end-war`, both locales and widths: **16/16 checks PASS**, HTTP 200,
  correct single heading, visible current template, no overflow, runtime errors
  or hydration errors. The unchanged template renders zero images; the check
  does not claim new media is displayed there. Krasny screenshots reviewed.
- Existing Nuxt performance-instrumentation timer warnings remain outside this
  pass; they are not hydration or media failures. No instrumentation changes.
- SHA-256 of full Timeline and detail templates matches the pre-pass baseline.

**Stage 5 IN PROGRESS. Stage 6 NOT STARTED.** Stop after this media pass.
