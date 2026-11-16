# my code formatter

A single-page formatter, beautifier and validator for **46 languages**. Everything runs in your browser.

## Supported languages

Pick a language from the dropdown in the top left, or use **Auto-detect**.

| Group | Languages |
|---|---|
| Data | JSON, JSON5, YAML, TOML, XML |
| Web | HTML, Vue, Angular template, Handlebars, CSS, SCSS, LESS, JavaScript / JSX, TypeScript / TSX, Flow, GraphQL, Markdown, MDX |
| Programming | Python, Go, Java, C, C++, C#, Objective-C, PHP, Dart, Lua, Shell / Bash, Zig, Protocol Buffers |
| SQL | Standard SQL, MySQL, MariaDB, PostgreSQL, SQL Server (T-SQL), Oracle PL/SQL, SQLite, BigQuery, Snowflake, Redshift, Spark SQL, Trino / Presto, Hive, IBM Db2 |

## Features

- **Format**: indent with 2 spaces, 4 spaces or tabs
- **Minify**: available for JSON, XML and CSS
- **Validate**: shows the exact error with its line, column and a caret pointing at it
- **JSON**: auto-fix for common mistakes, plus sort keys
- **Logs panel**: shows success, fixed, error and action history
- **Dark / light theme switch** (dark is the default)
- **Like button** (remembered per browser) and **Feedback form** (name, email, comment → saved to `feedback.txt`)
- **Extras**: copy output, open or drag-and-drop files (the language is picked from the file extension), and a sample for each language

## Files

```
index.html
server.js     ← tiny Node.js server: serves the site + saves feedback
package.json
vendor/       ← WebAssembly formatters (Python, Go, C/C++/Java/C#, Dart, Lua, Shell, Zig) + TOML parser
feedback.txt  ← created automatically when the first feedback arrives
```

Upload the whole `vendor` folder next to `index.html`.

## Running it with feedback saving (recommended)

You need [Node.js](https://nodejs.org) 18 or newer. No `npm install` is required.

```bash
node server.js          # → http://localhost:3000
PORT=8080 node server.js
```

Each feedback is **appended** to `feedback.txt` in the same folder, with a date, name, email and comment. The server never serves `feedback.txt` to visitors, and it limits each visitor to 5 submissions per 10 minutes.

To put it online with feedback, deploy the folder to any Node host, such as Render, Railway, Fly.io or a VPS. Use `npm start` as the start command.

## Running it without the server


- **On GitHub Pages**: every language works, but feedback can't be saved because GitHub Pages can't write files. The form will tell the visitor that.
- **Opened straight from disk** (`file://`): JSON, XML and the CDN-based languages still work. The `vendor` languages need the page to be served over http, for example with `python3 -m http.server`.
- Some languages are downloaded from a CDN the first time you use them, so you need an internet connection for those.

## Credits

[Prettier](https://prettier.io) · [@prettier/plugin-php](https://github.com/prettier/plugin-php) · [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) · [wasm-fmt](https://github.com/wasm-fmt) (ruff, gofmt, clang-format, dart_fmt, lua_fmt, shfmt, zig_fmt) · [smol-toml](https://github.com/squirrelchat/smol-toml) · [highlight.js](https://highlightjs.org)

---

© 2026 · Sir Troy. All rights reserved.
