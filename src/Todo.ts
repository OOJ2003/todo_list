import { invoke } from "@tauri-apps/api/tauri"

export interface todo {
  id: string
  content: string
  done: boolean
}

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

export const deleteTodo = async (
  key: string,
  all: todo[],
  fn: React.Dispatch<React.SetStateAction<todo[]>>
) => {
  const diff = all.find((e) => e.id === key)!

  fn(all.filter((i) => i.id !== key))
  await invoke<void>("delete", { item: diff })
}

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
