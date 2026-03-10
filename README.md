<div align="center">
  <img width="1000" alt="image" src="https://github.com/caido-community/.github/blob/main/content/banner.png?raw=true">

  <br />
  <br />
  <a href="https://github.com/caido-community" target="_blank">Github</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://developer.caido.io/" target="_blank">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://links.caido.io/www-discord" target="_blank">Discord</a>
  <br />
  <hr />
</div>

# JS Analyzer

JavaScript and static file analysis for Caido. JS Analyzer passively scans `.js`, `.mjs`, `.cjs`, `.json`, and `.map` files intercepted by the proxy and surfaces secrets, API endpoints, cloud URLs, subdomains, security sinks, and more — directly inside Caido.

## Installation

### From Plugin Store

1. Open Caido, navigate to the `Plugins` sidebar page.
2. Find `JS Analyzer` and click Install
3. Done! 🎉

### Manual Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the plugin:

   ```bash
   pnpm build
   ```

3. Install in Caido:
   - Upload the `dist/plugin_package.zip` file by clicking "Install Package" in Caido's plugin settings



## 🤝 Contributing

Feel free to contribute! If you'd like to request a feature or report a bug, please create a [GitHub Issue](https://github.com/caido-community/JS-Analyzer/issues/new).

### Ways to Contribute

- Report bugs and request features via GitHub Issues.
- Improve documentation and examples.
- Add new analysis capabilities.

### Validate Locally

Run linting, type checking, and a build from the repo root before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm knip
pnpm build
```

## 💚 Community

Join our [Discord](https://links.caido.io/www-discord) community and connect with other Caido users! Share your ideas, ask questions, and get involved in discussions around Caido and security testing.
