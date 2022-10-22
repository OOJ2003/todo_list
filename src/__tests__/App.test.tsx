import { expect, test } from "vitest"

import { mockIPC } from "@tauri-apps/api/mocks"
import { render, userEvent } from "../utils/test-utils"

import App from "../App"
import { todo } from "../Todo"

const TestTodo: todo = {
  id: "id-TestTodo",
  content: "content-TestTodo",
  done: false,
}

test("Insert new todo.", async () => {
  mockIPC((cmd, args) => {
    if (cmd === "get_all") {
      return []
    } else if (cmd === "insert" || "update" || "delete") {
      // do nothing
    }
  })
  const wrapper = render(<App />)

  const inputButton = wrapper
    .getAllByRole("button")
    .filter((i) => i.className === "ant-btn ant-btn-primary")[0]
  const inputArea = wrapper.getByRole("textbox") as HTMLInputElement

  //expect user input "test for fun" does not exist in dom at start
  expect(wrapper.queryByText("test for fun")).toBeNull()

  await userEvent.click(inputArea)
  await userEvent.keyboard("test for fun")
  await userEvent.click(inputButton)

  const clearButton = wrapper
    .getAllByRole("button")
    .filter((i) => i.className === "ant-input-clear-icon")[0]

  expect(inputArea.value).toBe("test for fun")

  await userEvent.click(clearButton)
  expect(inputArea.value).toBe("")

  //test <span>test for fun</span> exist, which is a part of a todo list item
  expect(wrapper.getByText("test for fun")).toBeInTheDocument()
})

test("Change todo state.", async () => {
  mockIPC((cmd, args) => {
    if (cmd === "get_all") {
      return [TestTodo]
    } else if (cmd === "insert" || "update" || "delete") {
      // do nothing
    }
  })

  const wrapper = render(<App />)
  expect(await wrapper.findByText("content-TestTodo"))

  const checkBox = (await wrapper.findByRole("checkbox")) as HTMLInputElement
  expect(checkBox).not.toBeChecked()

  await userEvent.click(checkBox)

  expect(
    (await wrapper.findByRole("checkbox")) as HTMLInputElement
  ).toBeChecked()
})

test("Insert and then delete todo.", async () => {
  mockIPC((cmd, args) => {
    if (cmd === "get_all") {
      return []
    } else if (cmd === "insert" || "update" || "delete") {
      // do nothing
    }
  })

  const wrapper = render(<App />)
  const inputButton = wrapper
    .getAllByRole("button")
    .filter((i) => i.className === "ant-btn ant-btn-primary")[0]
  const inputArea = wrapper.getByRole("textbox") as HTMLInputElement

  //expect user input "test for fun" does not exist in dom at start
  expect(wrapper.queryByText("test for fun")).toBeNull()

  await userEvent.click(inputArea)
  await userEvent.keyboard("test for fun")
  await userEvent.click(inputButton)

  //expect todo "test for fun" now exist in dom
  expect(wrapper.queryByText("test for fun")).not.toBeNull()

  const deleteButtons = await (
    await wrapper.findAllByRole("button")
  ).filter(
    (i) =>
      i.className === "ant-btn ant-btn-circle ant-btn-default ant-btn-icon-only"
  )

  const deleteAll = async () => {
    for (const i of deleteButtons) {
      await userEvent.click(i as HTMLButtonElement)
    }
  }
  await deleteAll()

  //expect no todos exist
  expect(wrapper.queryByText("test for fun")).toBeNull()
})
