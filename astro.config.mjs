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

// https://astro.build/config
export default defineConfig({
  // TODO: set this to your real domain once Cloudflare Pages is wired up.
  site: 'https://nicolascalvo.dev',
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: { theme: 'github-dark' },
  },
});
