/**
 * Inline JSON-LD structured data. Server-compatible — renders a raw
 * `<script type="application/ld+json">` block (the standard SEO pattern).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
