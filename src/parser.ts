export interface Task {
  completed?: boolean
  priority?: string
  completion?: string
  creation?: string
  description?: string
  projects?: Array<string>
  contexts?: Array<string>
  pairs?: Array<[string, string]>
}

function peek<T> (array: Array<T>, last: number = 1): T {
  return array[array.length - last]
}

function tokenize (line: string): Array<string> {
  return line.split(/\s/).reverse()
}

function isComplete (tokens: Array<string>): boolean {
  if (peek(tokens) === 'x') {
    tokens.pop()
    return true
  }
  return false
}

function priority (tokens: Array<string>): string | undefined {
  if (peek(tokens)?.match(/^\([A-Z]\)$/)) {
    return tokens.pop()
  }
}

function isDate (str: string): boolean {
  return Boolean(str?.match(/^\d\d\d\d-\d\d-\d\d$/) && new Date(str).toJSON())
}

function completionDate (tokens: Array<string>): string | undefined {
  if (isDate(peek(tokens, 2)) && isDate(peek(tokens))) {
    return tokens.pop()
  }
}

function creationDate (tokens: Array<string>): string | undefined {
  if (isDate(peek(tokens))) {
    return tokens.pop()
  }
}

/* NOTE reverses tokens */
function addDescription (task: Task, tokens: Array<string>): void {
  task.description = tokens.reverse().join(' ')
  task.projects = []
  task.contexts = []
  task.pairs = []
  for (const token of tokens.filter(t => t.length > 1)) {
    switch (token[0]) {
      case '+':
        task.projects.push(token)
        break
      case '@':
        task.contexts.push(token)
        break
      default: {
        const index = token.indexOf(':')
        if (index > 0 && index < token.length - 1) {
          task.pairs.push([token.slice(0, index), token.slice(index + 1)])
        }
      }
    }
  }
}

function parseTask (line: string): Task {
  const tokens = tokenize(line)
  const task: Task = {
    completed: isComplete(tokens),
    priority: priority(tokens),
    completion: completionDate(tokens),
    creation: creationDate(tokens)
  }
  addDescription(task, tokens)
  return task
}

export function parse (todo: string): Array<Task> {
  return todo.split('\n').map(line => parseTask(line))
}
