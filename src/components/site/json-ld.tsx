/**
 * Renders one schema.org graph as a script tag.
 *
 * JSON.stringify rather than a template literal, for the same reason the root
 * layout does it: the values are ours, but hand-serialising is how a stray
 * quote becomes broken markup.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
