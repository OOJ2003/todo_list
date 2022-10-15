import React, { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { Checkbox, List, Button, Input } from "antd"
import { PlusOutlined, CloseOutlined } from "@ant-design/icons"
import "antd/dist/antd.css"
import { changeTodoDone, deleteTodo, insertNewTodo, todo } from "./Todo"

function App() {
  const [todos, setTodos] = useState<todo[]>([])
  const [initFlag, setInitFlag] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const ascTodos = (a: todo, b: todo) => (a.id > b.id ? 1 : -1)

  //组件挂载时初始化数据
  useEffect(() => {
    if (!initFlag) {
      invoke<todo[]>("get_all").then((i) => setTodos(i))
      setInitFlag(!initFlag)
    }
  }, [])

  //自定义列表组件
  interface TodoListProps {
    fn: (i: todo) => boolean
  }

  const TodoList: React.FC<TodoListProps> = (props) => {
    return (
      <List size="large">
        {todos
          .sort(ascTodos)
          .filter(props.fn)
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
      {/* 未完成todo表 */}
      <TodoList fn={(i) => !i.done} />
      {/* 已完成todo表 */}
      <TodoList fn={(i) => i.done} />

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
            insertNewTodo(inputValue, todos, setTodos)
          }}
        >
          <PlusOutlined />
        </Button>
      </Input.Group>
    </div>
  )
}

export default App
