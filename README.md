# Senior2026

## Coach Abdelwahab & Ashraf Senior 2026 Competitive Programming Library

Senior2026 is a public static Competitive Programming tutorial portal prepared for Senior 2026 training by Coach Abdelwahab and Ashraf under Coach Academy.

The portal organizes algorithm, data structure, paradigm, graph, and geometry HTML tutorials into a searchable, navigable, GitHub Pages-ready learning library. The original tutorial HTML files are imported unchanged, and the public website adds only non-destructive wrapper pages, metadata, search, navigation, and video catalog pages around them.

## Prepared By

- Coach Abdelwahab
- Ashraf
- Coach Academy

## Repository Structure

```text
Senior2026/
  index.html
  topics.html
  about.html
  roadmap.html
  videos.html
  404.html
  README.md
  RIGHTS.md
  assets/
    css/
      portal.css
    js/
      portal.js
      topics-data.js
      search.js
    data/
      topics.json
      videos.json
      tutorial-checksums.json
  learn/
    generated tutorial wrapper pages
  tutorials/
    graphs/
    paradigms/
    data-structures/
    geometry/
  tools/
    import-tutorials.js
    generate-topics-data.js
    validate-links.js
    validation-report.json
  .github/
    workflows/
      pages.yml
```

## Topic Categories

- Graphs
- Paradigms
- Data Structures
- Geometry

## Running Locally

Use any static file server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

The site is static and does not require a backend.

## Importing Tutorials

To re-import tutorials from the original ZIP while preserving content exactly:

```bash
node tools/import-tutorials.js /path/to/HTML.zip
```

This copies HTML files into normalized folders under `tutorials/` and writes `assets/data/tutorial-checksums.json`. The checksum file is used to confirm that imported tutorial content has not changed after import.

## Regenerating Topic Metadata and Pages

After importing tutorials or editing video metadata, regenerate the topic data and wrapper pages:

```bash
node tools/generate-topics-data.js
```

This updates:

- `assets/data/topics.json`
- `assets/js/topics-data.js`
- `learn/*.html`
- the main portal pages

Topic titles, descriptions, tags, and search metadata are derived from filenames and category names only.

## Adding a New Tutorial

1. Add the new standalone HTML tutorial to the correct category folder in the source `HTML.zip`.
2. Run the import command again.
3. Run the generator command again.
4. Run validation.

The generator will discover the new file, infer metadata from its filename, create a wrapper page, and add it to the topic browser.

## Adding or Updating Video Links

Edit `assets/data/videos.json`:

```json
{
  "order": 24,
  "category": "Data Structure",
  "title": "Example Topic",
  "url": "https://youtu.be/example"
}
```

Then run:

```bash
node tools/generate-topics-data.js
node tools/validate-links.js
```

The generator matches videos to tutorials by normalized title keys and known filename mappings.

## Validation

Run:

```bash
node tools/validate-links.js
```

The validation script checks that:

- Every tutorial HTML file exists.
- Every topic in `topics.json` points to an existing tutorial.
- Every tutorial file is represented in `topics.json`.
- Every video URL uses the expected YouTube short-link format.
- Generated internal links are relative and resolve correctly.
- Categories are present and valid.
- Topic numbers are not duplicated.
- Tutorial file checksums still match the original imported bytes.

The script writes `tools/validation-report.json`.

## GitHub Pages Deployment

This repository includes `.github/workflows/pages.yml`, which deploys the repository root to GitHub Pages whenever changes are pushed to `main`.

Expected public URL format:

```text
https://USERNAME.github.io/Senior2026/
```

All links are relative, so the portal works correctly under the `/Senior2026/` project path.

## Contact

- coach@coach-academy.net
- wahab@acpc.global
- m.abdelwahab@fci-cu.edu.eg

LinkedIn:

- Ashraf / Coach Academy: https://www.linkedin.com/in/cewatlac/
- Coach Abdelwahab: https://www.linkedin.com/in/mohamed-mahmoud-abd-el-wahab-mohamed-abd-el-moneim-mahmoud-6944152/

## Rights Notice

© 2026 Coach Academy. All rights reserved.

This project and its tutorial content are copyrighted. The content may not be copied, redistributed, modified, republished, or reused without prior written permission from Coach Academy. See `RIGHTS.md`.
