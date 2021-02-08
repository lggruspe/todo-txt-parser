todo-txt-parser
===============

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

License
-------

MIT.
