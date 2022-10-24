import React, { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { Checkbox, List, Button, Input } from "antd"
import { PlusOutlined, CloseOutlined } from "@ant-design/icons"
import "antd/dist/antd.css"
import { changeTodoDone, deleteTodo, insertNewTodo, todo } from "./Todo"

function App() {
  const [todos, setTodos] = useState<todo[]>([])
  const [inputValue, setInputValue] = useState("")
  const ascTodos = (a: todo, b: todo) => (a.id > b.id ? 1 : -1)

  //get data from backend when App mountain
  useEffect(() => {
    invoke<todo[]>("get_all").then((i) => setTodos(i))
  }, [])

  interface TodoListProps {
    filterFn: (i: todo) => boolean
  }

  /**
   * @description A custom todo list component
   */
  const TodoList: React.FC<TodoListProps> = (props) => {
    return (
      <List size="large">
        {todos
          .sort(ascTodos)
          .filter(props.filterFn)
          .map((i) => {
            return (
              <List.Item key={i.id}>
                <Checkbox
                  checked={i.done}
                  key={i.id}
                  onChange={() => changeTodoDone(i.id, todos, setTodos).then()}
                >
                  {i.content}
                </Checkbox>
                <Button
                  icon={<CloseOutlined />}
                  shape={"circle"}
                  onClick={() => deleteTodo(i.id, todos, setTodos).then()}
                />
              </List.Item>
            )
          })}
      </List>
    )
  }

  return (
    <div>
      {/* Unfinished todo list (state done set to false) */}
      <TodoList filterFn={(i) => !i.done} />
      {/* Finished todo list (state done set to true) */}
      <TodoList filterFn={(i) => i.done} />

      <Input.Group compact>
        <Input
          style={{ width: "calc(100% - 45px)", height: "40px" }}
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          allowClear={true}
        />
        <Button
          style={{ height: "40px" }}
          type="primary"
          onClick={() => {
            insertNewTodo(inputValue, todos, setTodos).then()
          }}
        >
          <PlusOutlined />
        </Button>
      </Input.Group>
    </div>
  )
}

export default App
