todo-txt-parser
===============

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lggruspe/todo-txt-parser/Node.js%20CI)
[![codecov](https://codecov.io/gh/lggruspe/todo-txt-parser/branch/main/graph/badge.svg?token=KICVMONX12)](https://codecov.io/gh/lggruspe/todo-txt-parser)
![npm (scoped)](https://img.shields.io/npm/v/@lggruspe/todo-txt-parser)
![GitHub](https://img.shields.io/github/license/lggruspe/todo-txt-parser)

todo.txt parser for Typescript/Javascript.

Installation
------------

```bash
npm install @lggruspe/todo-txt-parser
```

Usage
-----

```javascript
import { parse } from '@lggruspe/todo-txt-parser'
import { readFileSync } from 'fs'

const todo = readFileSync('todo.txt', 'utf8').trim()
const tasks = parse(todo)
```

Each `Task` contains the following fields.

```typescript
interface Task {
  completed?: boolean
  priority?: string
  completion?: string
  creation?: string
  description?: string
  projects?: Array<string>
  contexts?: Array<string>
  pairs?: Array<[string, string]>
}
```

See `examples/`.

License
-------

MIT.
