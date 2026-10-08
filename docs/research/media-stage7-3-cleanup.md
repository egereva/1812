# Stage 7.3 — media metadata and documentation cleanup

2026-10-08. Cleanup complete; **Stage 7 remains IN PROGRESS**, Stage 7.2 ACCEPTED (user-reported), Stage 6 COMPLETE / ACCEPTED. Stage 8 NOT STARTED.

## Corrections

- Savrasov 1884 manifest/rights target now points to the existing `public/images/dictionary/kutuzov-hut-savrasov-1884.jpg`, reused by Places. No image was moved or renamed.
- Church 2012 remains an approved rights record with its original creator, date, license, source URL, dimensions, caption and proposed target. Explicit `unused-candidate` / `not-delivered` metadata distinguishes it from production. Production Church media use the separately attributed 2019 original. No candidate metadata or media was deleted.
- CONTENT no longer claims all binaries are pending or the manifest contains only 11 entries. It records 24 editorial selection records (23 delivered targets and one archived candidate), distinct from the full production inventory: 42 originals and 56 derivatives for 29 originals.
- Current documentation covers static responsive delivery, original-resolution PhotoSwipe, identical RU/EN coverage (Dictionary 23/29, Timeline 17/20, Places 10/13), intentional no-image layouts, four active comparisons and deferred Kutuzov Hut. Historical stage reports retain their time-specific evidence. Stage 7.2 acceptance is recorded without claiming its earlier tests were newly executed.

## Focused verification

- **26/26 PASS**: content/source parity, Hero manifest contract, image-delivery integrity and existing generated-output checks. All 42 original SHA-256 hashes and all 56 generated candidates verified. No build or generation repeated.
- Manifest JSON parses; all 23 delivered targets exist. Only the Savrasov and Church candidate records changed; all 24 records and verified attribution/rights/source fields are retained unchanged.
- Processor independence: `generate` is `nuxt generate`; no build/generate processor hooks. All derivatives are present in `public/images/delivery/` and existing `.output/public/images/delivery/`. No CI workflow currently exists in the repository. Generation/static deployment requires the prepared files, not System.Drawing or Windows.
- Skip link browser check: existing generated EN Triumphal Arch page at 390/1440 px. At rest and with the comparison slider focused, the link is unfocused and its bottom is -24.80 px (above the viewport). Focusing the link moves its top to 0. CSS exposes it only through `.skip-link:focus`. Its visibility in keyboard QA screenshots is focus-dependent; no UI change is needed or made.
- Metadata/report formatting and documentation diff checks pass. Existing application/content/media changes from earlier work were preserved unchanged by this cleanup.

## Remaining Stage 7 acceptance considerations

No new mandatory media implementation gap was found. The existing prepared catalog and 56 derivatives are **currently untracked**, although not ignored; include them in the eventual deployment commit so a fresh CI checkout receives them. Local generated output already contains them. This cleanup does not stage or commit files, configure CI, or declare deployment complete.

Kutuzov Hut comparison, optional historical imagery for unillustrated entities and additional comparisons remain intentionally deferred/nonblocking. Additional browser coverage beyond the previously recorded Chromium checks is optional. Official Stage 7 acceptance/closure has not been requested; Stage 7 remains IN PROGRESS.

## Exact files changed in this pass

- `docs/research/media-manifest.json`
- `docs/research/image-rights.md`
- `docs/research/attribution.md`
- `docs/CONTENT.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/research/image-delivery-stage7-2.md`
- `docs/research/media-stage7-3-cleanup.md` (this report)

No application code, content JSON, originals, derivatives, image subjects/crops or historical attribution were changed.
