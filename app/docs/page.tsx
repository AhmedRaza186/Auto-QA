import { C } from "../page";

export const metadata = {
  title: "Documentation",
  description: "AutoTest platform documentation",
};

export default function DocsPage() {
  return (
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif",
      background: C.bg,
      color: C.ink,
      minHeight: "100vh",
      padding: "2rem",
      lineHeight: 1.6,
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Documentation</h1>
      <section>
        <h2>1. Introduction</h2>
        <ul>
          <li>What is the platform</li>
          <li>Core features</li>
          <li>Supported frameworks</li>
        </ul>
      </section>
      <section>
        <h2>2. Getting Started</h2>
        <ul>
          <li>Create account</li>
          <li>Connect GitHub</li>
          <li>Add credits</li>
          <li>Generate first test case</li>
        </ul>
      </section>
      <section>
        <h2>3. Repository Integration</h2>
        <ul>
          <li>GitHub OAuth setup</li>
          <li>Selecting repositories</li>
          <li>Branch selection</li>
          <li>Source code analysis</li>
        </ul>
      </section>
      <section>
        <h2>4. AI Test Case Generation</h2>
        <ul>
          <li>How generation works</li>
          <li>Supported project types</li>
          <li>Test case categories</li>
          <li>Best practices</li>
        </ul>
      </section>
      <section>
        <h2>5. Playwright Execution Engine</h2>
        <ul>
          <li>Local execution</li>
          <li>Browser execution</li>
          <li>Generated scripts</li>
          <li>Logs and debugging</li>
        </ul>
      </section>
      <section>
        <h2>6. Test Case Management</h2>
        <ul>
          <li>Generated tests</li>
          <li>Editing tests</li>
          <li>Re‑running tests</li>
          <li>Status tracking</li>
        </ul>
      </section>
      <section>
        <h2>7. Credits System</h2>
        <ul>
          <li>Credit consumption</li>
          <li>Generation costs</li>
          <li>Execution costs</li>
        </ul>
      </section>
      <section>
        <h2>8. API Reference</h2>
        <ul>
          <li>Generate Test Cases</li>
          <li>Run Test Case</li>
          <li>Get Test Cases</li>
          <li>Repository APIs</li>
        </ul>
      </section>
      <section>
        <h2>9. Troubleshooting</h2>
        <ul>
          <li>GitHub token issues</li>
          <li>Empty repository context</li>
          <li>Browser launch failures</li>
          <li>Script execution errors</li>
        </ul>
      </section>
      <section>
        <h2>10. FAQ</h2>
        <ul>
          <li>Supported frameworks</li>
          <li>Private repositories</li>
          <li>Credit usage</li>
          <li>Browser support</li>
        </ul>
      </section>
      <section>
        <h2>11. Security</h2>
        <ul>
          <li>GitHub permissions</li>
          <li>Repository access</li>
          <li>Data storage</li>
        </ul>
      </section>
      <section>
        <h2>12. Changelog</h2>
        <ul>
          <li>New features</li>
          <li>Improvements</li>
          <li>Bug fixes</li>
        </ul>
      </section>
    </div>
  );
}
