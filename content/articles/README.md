# Artikujt në Hayat

1. Krijo skedarin e artikullit duke kopjuar `article-template.json`.
2. Vendos imazhin WebP te `content/articles/images/`.
3. Shto metadata-n te `index.json` dhe rrit `version`.
4. Përdor vetëm blloqet: `paragraph`, `heading2`, `heading3`, `quote`, `list`.
5. Mos vendos HTML, skripte ose URL të jashtme në përmbajtje.

Shembull metadata-je në `index.json`:

```json
{
  "id": "deti-i-vdekur",
  "titleSq": "Deti i Vdekur, ndëshkim dhe mëshirë",
  "authorSq": "Emri i autorit",
  "categorySq": "Histori",
  "publishedAt": "2026-07-18",
  "readingMinutes": 6,
  "excerptSq": "Një përmbledhje e shkurtër.",
  "imageUrl": "content/articles/images/deti-i-vdekur.webp",
  "contentUrl": "content/articles/deti-i-vdekur.json"
}
```
