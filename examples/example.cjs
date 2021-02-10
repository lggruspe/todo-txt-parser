const { TodoTxt } = require('@lggruspe/todo-txt-parser')
const { readFileSync } = require('fs')

const todo = readFileSync('todo.txt', 'utf8').trim()
const todoTxt = new TodoTxt().parse(todo)
console.log(todoTxt.tasks)

const sorted = todoTxt.sort()
console.log(sorted.tasks)

const filtered = sorted.filter(task => task.projects.includes('+project'))
console.log(filtered.tasks)

console.log(String(todoTxt), '\n')
console.log(String(sorted), '\n')
console.log(String(filtered), '\n')

console.log(todoTxt.suggestTags('+'))
console.log(todoTxt.suggestTags('@con'))
