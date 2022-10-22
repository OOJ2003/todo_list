import { invoke } from "@tauri-apps/api/tauri"

/**
 * @description A basic todo.
 * @param id The unique id of todo, useful in list.
 * @param content Todo's content.
 * @param done When done is true, it means the todo is finished.
 */
export interface todo {
  id: string
  content: string
  done: boolean
}

/**
 * @description Change a todo's state(finish or unfinished).
 * @param key The id of the todo item which you want to change it's state.
 * @param all A collection of all the existing todos.
 * @param fn A function which can updates the component's state.
 */
export const changeTodoDone = async (
  key: string,
  all: todo[],
  fn: React.Dispatch<React.SetStateAction<todo[]>>
) => {
  const diff = all.find((e) => e.id === key)!
  const temp = { ...diff, done: !diff.done }

  fn([temp, ...all.filter((i) => i.id !== key)])
  await invoke<void>("update", { item: temp })
}

/**
 * @description Delete a todo.
 * @param key The id of the todo item which you want to delete it.
 * @param all A collection of all the existing todos.
 * @param fn A function which can updates the component's state.
 */
export const deleteTodo = async (
  key: string,
  all: todo[],
  fn: React.Dispatch<React.SetStateAction<todo[]>>
) => {
  const diff = all.find((e) => e.id === key)!

  fn(all.filter((i) => i.id !== key))
  await invoke<void>("delete", { item: diff })
}

/**
 * @description Create and insert a new todo.
 * @param content The content of the new todo.
 * @param all A collection of all the existing todos.
 * @param fn A function which can updates the component's state.
 *
 */
export const insertNewTodo = async (
  content: string,
  all: todo[],
  fn: React.Dispatch<React.SetStateAction<todo[]>>
) => {
  if (content === "") {
    return
  }
  const temp: todo = {
    id: Date.now() + content,
    content: content,
    done: false,
  }

  fn([temp, ...all])
  await invoke<void>("insert", { item: temp })
}
