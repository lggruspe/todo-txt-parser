import { Task, parse } from '../src/parser'
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
