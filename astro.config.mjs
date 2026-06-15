import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';

// Turn ```mermaid fenced code blocks into <pre class="mermaid"> so the client
// mermaid runtime (loaded in BaseLayout) can render them. Keeps diagrams portable:
// the exact same fenced blocks already used in the GitHub workshop just work here.
function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<pre class="mermaid">${node.value}</pre>`;
      }
    });
  };
}

// Estimate reading time from word count and expose it as frontmatter.
function remarkReadingTime() {
  return (tree, file) => {
    let words = 0;
    visit(tree, 'text', (node) => {
      words += node.value.trim().split(/\s+/).filter(Boolean).length;
    });
    file.data.astro.frontmatter.minutesRead = Math.max(1, Math.round(words / 200));
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://nicolasandrescalvo.com',
  markdown: {
    remarkPlugins: [remarkMermaid, remarkReadingTime],
    shikiConfig: { theme: 'github-dark' },
  },
});
