import { Task, TodoTxt, compareTasks, parse } from '../src/parser'
import * as assert from 'assert'

function checkDesc (task: Task, description: string): void {
  assert.strictEqual(task.description, description)
}

describe('parse', () => {
  it('should parse completion mark', () => {
    const todo = `test description
(x) x test description
X test description
xtest description
x test description`
    const tasks = parse(todo)
    assert.ok(!tasks[0].completed)
    assert.ok(!tasks[1].completed)
    assert.ok(!tasks[3].completed)
    assert.ok(tasks[4].completed)

    checkDesc(tasks[0], 'test description')
    checkDesc(tasks[1], '(x) x test description')
    checkDesc(tasks[2], 'X test description')
    checkDesc(tasks[3], 'xtest description')
    checkDesc(tasks[4], 'test description')
  })

  it('should parse priority', () => {
    const todo = `() test description
(A) test description
(a) test description
(A)test description`
    const tasks = parse(todo)
    assert.ok(!tasks[0].priority)
    assert.strictEqual(tasks[1].priority, '(A)')
    assert.ok(!tasks[2].priority)
    assert.ok(!tasks[3].priority)

    checkDesc(tasks[0], '() test description')
    checkDesc(tasks[1], 'test description')
    checkDesc(tasks[2], '(a) test description')
    checkDesc(tasks[3], '(A)test description')
  })

  it('should parse creation date', () => {
    const todo = `test description
x 2020-01-01 test description
2020-01-32 test description
1 test description`
    const tasks = parse(todo)
    assert.ok(!tasks[0].creation)
    assert.ok(tasks[1].creation)
    assert.ok(!tasks[2].creation)
    assert.ok(!tasks[3].creation)

    checkDesc(tasks[0], 'test description')
    checkDesc(tasks[1], 'test description')
    checkDesc(tasks[2], '2020-01-32 test description')
    checkDesc(tasks[3], '1 test description')
  })

  it('should parse completion date', () => {
    const todo = `test description
x 2020-01-01 test description
2020-01-01 2020-01-32 test description
2020-01-32 2020-01-01 test description
x 2020-01-01 2020-01-01 test description`
    const tasks = parse(todo)
    assert.ok(!tasks[0].completion)
    assert.ok(!tasks[1].completion)
    assert.ok(!tasks[2].completion)
    assert.ok(!tasks[3].completion)
    assert.ok(tasks[4].completion)

    assert.ok(!tasks[0].creation)
    assert.ok(tasks[1].creation)
    assert.ok(tasks[2].creation)
    assert.ok(!tasks[3].creation)
    assert.ok(tasks[4].creation)

    checkDesc(tasks[0], 'test description')
    checkDesc(tasks[1], 'test description')
    checkDesc(tasks[2], '2020-01-32 test description')
    checkDesc(tasks[3], '2020-01-32 2020-01-01 test description')
    checkDesc(tasks[4], 'test description')
  })

  describe('project tags', () => {
    it('should not parse invalid tags', () => {
      const todo = `+ test description
x+ test description
1 + 1 = 2 test description`
      const tasks = parse(todo)
      assert.strictEqual(tasks[0].projects?.length, 0)
      assert.strictEqual(tasks[1].projects?.length, 0)
      assert.strictEqual(tasks[2].projects?.length, 0)

      checkDesc(tasks[0], '+ test description')
      checkDesc(tasks[1], 'x+ test description')
      checkDesc(tasks[2], '1 + 1 = 2 test description')
    })

    it('should parse valid tags', () => {
      const todo = `+test description
test +description
+test +description`
      const tasks = parse(todo)
      assert.deepStrictEqual(tasks[0].projects, ['+test'])
      assert.deepStrictEqual(tasks[1].projects, ['+description'])
      assert.deepStrictEqual(tasks[2].projects, ['+test', '+description'])

      checkDesc(tasks[0], '+test description')
      checkDesc(tasks[1], 'test +description')
      checkDesc(tasks[2], '+test +description')
    })
  })

  describe('context tags', () => {
    it('should not parse invalid tags', () => {
      const todo = `@ test description
x@ test description
1 @ 1 = 2 test description`
      const tasks = parse(todo)
      assert.strictEqual(tasks[0].contexts?.length, 0)
      assert.strictEqual(tasks[1].contexts?.length, 0)
      assert.strictEqual(tasks[2].contexts?.length, 0)

      checkDesc(tasks[0], '@ test description')
      checkDesc(tasks[1], 'x@ test description')
      checkDesc(tasks[2], '1 @ 1 = 2 test description')
    })

    it('should parse valid tags', () => {
      const todo = `@test description
test @description
@test @description`
      const tasks = parse(todo)
      assert.deepStrictEqual(tasks[0].contexts, ['@test'])
      assert.deepStrictEqual(tasks[1].contexts, ['@description'])
      assert.deepStrictEqual(tasks[2].contexts, ['@test', '@description'])

      checkDesc(tasks[0], '@test description')
      checkDesc(tasks[1], 'test @description')
      checkDesc(tasks[2], '@test @description')
    })
  })

  describe('key-value tags', () => {
    it('should not parse invalid tags', () => {
      const todo = `: test description
key: test description
:val test description`
      const tasks = parse(todo)
      assert.strictEqual(tasks[0].pairs?.length, 0)
      assert.strictEqual(tasks[1].pairs?.length, 0)
      assert.strictEqual(tasks[2].pairs?.length, 0)

      checkDesc(tasks[0], ': test description')
      checkDesc(tasks[1], 'key: test description')
      checkDesc(tasks[2], ':val test description')
    })

    it('should parse valid tags', () => {
      const todo = 'key:val test description val:key'
      const [task] = parse(todo)
      assert.deepStrictEqual(task.pairs, [['key', 'val'], ['val', 'key']])
      checkDesc(task, 'key:val test description val:key')
    })
  })

  it('should parse empty line', () => {
    const [task] = parse('')
    assert.ok(!task.completed)
    assert.ok(!task.priority)
    assert.ok(!task.completion)
    assert.ok(!task.creation)
    assert.ok(!task.projects || task.projects.length === 0)
    assert.ok(!task.contexts || task.contexts.length === 0)
    assert.ok(!task.pairs || task.pairs.length === 0)
    checkDesc(task, '')
  })
})

it('compareTasks', () => {
  const [a, b] = new TodoTxt().parse('(A)\n(B)').tasks
  assert.ok(compareTasks(a, b) < 0)
  assert.ok(compareTasks(a, a) === 0)
  assert.ok(compareTasks(b, b) === 0)
  assert.ok(compareTasks(b, a) > 0)
})

describe('TodoTxt', () => {
  describe('constructor', () => {
    it('should create object with no tasks or tags', () => {
      const todoTxt = new TodoTxt()
      assert.strictEqual(todoTxt.tasks.length, 0)
      assert.strictEqual(todoTxt.projects.size, 0)
      assert.strictEqual(todoTxt.contexts.size, 0)
    })
  })

  describe('parse', () => {
    function createTodoTxt () {
      const todo = '+project1 @context1\n+project2 @context2'
      return new TodoTxt().parse(todo)
    }

    it('should parse input string', () => {
      const tasks = createTodoTxt().tasks
      assert.strictEqual(tasks[0].description, '+project1 @context1')
      assert.strictEqual(tasks[1].description, '+project2 @context2')
    })

    it('should automatically update tags', function () {
      const todoTxt = createTodoTxt()
      assert.ok(todoTxt.projects.has('+project1'))
      assert.ok(todoTxt.projects.has('+project2'))
      assert.ok(todoTxt.contexts.has('@context1'))
      assert.ok(todoTxt.contexts.has('@context2'))
      assert.strictEqual(todoTxt.projects.size, 2)
      assert.strictEqual(todoTxt.contexts.size, 2)
    })
  })

  describe('sort', () => {
    function createTodoTxt () {
      const todo = '(B) task 2\n(A) task 1'
      return new TodoTxt().parse(todo)
    }

    it('should create a sorted TodoTxt without modifying the original', () => {
      const original = createTodoTxt()
      assert.strictEqual(original.tasks.length, 2)
      assert.ok(original.tasks[0].priority)
      assert.ok(original.tasks[1].priority)
      assert.ok(compareTasks(original.tasks[0], original.tasks[1]) > 0)

      const sorted = original.sort()
      assert.strictEqual(sorted.tasks.length, 2)
      assert.ok(sorted.tasks[0].priority)
      assert.ok(sorted.tasks[1].priority)
      assert.ok(compareTasks(sorted.tasks[0], sorted.tasks[1]) < 0)
    })

    describe('with compare function', () => {
      it('should sort using the compare function', () => {
        function inReverse (a: Task, b: Task) {
          return compareTasks(b, a)
        }
        const sorted = createTodoTxt().sort()
        const reversed = sorted.sort(inReverse)
        assert.deepStrictEqual(sorted.tasks, reversed.tasks.reverse())
      })
    })
  })

  describe('filter', () => {
    function createTodoTxt () {
      const todo = `task1 +project
task2 @context
task3 +project
task4 @context
task5`
      return new TodoTxt().parse(todo)
    }

    function withProject (tag: string) {
      return function (task: Task): boolean {
        return Boolean(task.projects?.includes(tag))
      }
    }

    function withContext (tag: string) {
      return function (task: Task): boolean {
        return Boolean(task.contexts?.includes(tag))
      }
    }

    it('should create a TodoTxt containing the filtered tasks with updated tags and without modifying the original TodoTxt', () => {
      const original = createTodoTxt()

      const projects = original.filter(withProject('+project'))
      assert.strictEqual(projects.tasks.length, 2)
      assert.strictEqual(projects.projects.size, 1)
      assert.strictEqual(projects.contexts.size, 0)
      assert.ok(projects.projects.has('+project'))

      const contexts = original.filter(withContext('@context'))
      assert.strictEqual(contexts.tasks.length, 2)
      assert.strictEqual(contexts.projects.size, 0)
      assert.strictEqual(contexts.contexts.size, 1)
      assert.ok(contexts.contexts.has('@context'))

      assert.strictEqual(original.tasks.length, 5)
      assert.strictEqual(original.projects.size, 1)
      assert.strictEqual(original.contexts.size, 1)
      assert.ok(original.projects.has('+project'))
      assert.ok(original.contexts.has('@context'))
    })
  })

  describe('toString', () => {
    it('should reconstruct todo.txt string', () => {
      const todo = `x (A) 2021-01-01 2020-01-01 task
2020-01-01 task
task +project @context key:val`
      const todoTxt = new TodoTxt().parse(todo)
      assert.strictEqual(todo, String(todoTxt))
    })

    describe('with empty todo.txt', () => {
      it('should return empty string', () => {
        assert.strictEqual(String(new TodoTxt()), '')
        assert.strictEqual(String(new TodoTxt().parse('')), '')
      })
    })
  })

  describe('suggestTags', () => {
    function createTodoTxt () {
      const todo = '+project1 +project2\n@context1 @context2'
      return new TodoTxt().parse(todo)
    }

    describe('with invalid tag prefix', () => {
      describe('on "+"', () => {
        it('should return all project tags', () => {
          const todoTxt = createTodoTxt()
          const suggestions = todoTxt.suggestTags('+').sort()
          assert.deepStrictEqual(suggestions, ['+project1', '+project2'])
        })
      })

      describe('on "@"', () => {
        it('should return all context tags', () => {
          const todoTxt = createTodoTxt()
          const suggestions = todoTxt.suggestTags('@').sort()
          assert.deepStrictEqual(suggestions, ['@context1', '@context2'])
        })
      })

      it('should return an empty array', () => {
        const todoTxt = createTodoTxt()
        assert.deepStrictEqual(todoTxt.suggestTags(''), [])
        assert.deepStrictEqual(todoTxt.suggestTags('project'), [])
        assert.deepStrictEqual(todoTxt.suggestTags('context'), [])
      })
    })

    describe('with + prefix', () => {
      it('should return project tags that match the prefix', () => {
        const todoTxt = createTodoTxt()
        const project = todoTxt.suggestTags('+project').sort()
        assert.deepStrictEqual(project, ['+project1', '+project2'])

        const project1 = todoTxt.suggestTags('+project1')
        assert.deepStrictEqual(project1, ['+project1'])
      })
    })

    describe('with @ prefix', () => {
      it('should return context tags that match the prefix', () => {
        const todoTxt = createTodoTxt()
        const context = todoTxt.suggestTags('@context').sort()
        assert.deepStrictEqual(context, ['@context1', '@context2'])

        const context1 = todoTxt.suggestTags('@context1')
        assert.deepStrictEqual(context1, ['@context1'])
      })
    })
  })

  describe('updateTags', () => {
    describe('with tagless tasks', () => {
      it('should not crash', () => {
        const todoTxt = new TodoTxt()
        todoTxt.tasks.push({})
        todoTxt.updateTags()
        assert.strictEqual(todoTxt.projects.size, 0)
        assert.strictEqual(todoTxt.contexts.size, 0)
      })
    })
  })
})
