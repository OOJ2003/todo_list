use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::{fs::create_dir, path::Path, sync::Mutex};
use tauri::api::path::local_data_dir;

#[derive(Serialize, Deserialize, Debug)]
pub struct Todo {
    pub id: String,
    pub content: String,
    pub done: bool,
}

pub struct Database {
    pub db: Mutex<Connection>,
}

impl Database {
    pub fn new_init() -> Result<Self> {
        let mut folder = local_data_dir().unwrap();
        folder.push("todo_list");
        let mut db = folder.clone();

        if !Path::new(&folder).exists() {
            create_dir(&folder).unwrap();
        }

        db.push(format!("data.db"));

        let flag = db.as_path().exists();
        let conn = Connection::open(db.as_path())?;

        if !flag {
            conn.execute(
                "CREATE TABLE TODO (
    id TEXT PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    done BOOL NOT NULL
)",
                (),
            )?;
        }

        Ok(Self {
            db: Mutex::from(conn),
        })
    }
}

#[tauri::command]
pub fn get_all(state: tauri::State<Database>) -> Vec<Todo> {
    let unlocked = state.db.lock().unwrap();

    let stmt = &mut unlocked
        .prepare("SELECT id, content, done FROM TODO")
        .unwrap();
    let rows = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0).unwrap(),
                content: row.get(1).unwrap(),
                done: row.get(2).unwrap(),
            })
        })
        .unwrap();
    rows.into_iter()
        .flat_map(|x| x)
        .collect()
}

fn execute_sql(state: &tauri::State<Database>, sql: &str, msg: &str) {
    match state
        .db
        .lock()
        .unwrap()
        .execute(sql, ())
    {
        Ok(_) => {}
        Err(x) => {
            println!("{msg} error: {x}")
        }
    }
}

#[tauri::command]
pub fn insert(item: Todo, state: tauri::State<Database>) {
    let sql = format!(
        "INSERT INTO TODO VALUES ('{}', '{}', {})",
        item.id, item.content, item.done
    );
    execute_sql(&state, &sql, "insert")
}

#[tauri::command]
pub fn update(item: Todo, state: tauri::State<Database>) {
    let sql = format!(
        "UPDATE TODO SET content='{}', done={} WHERE id='{}'",
        item.content, item.done, item.id
    );
    execute_sql(&state, &sql, "update")
}

#[tauri::command]
pub fn delete(item: Todo, state: tauri::State<Database>) {
    let sql = format!("DELETE FROM TODO WHERE id='{}'", item.id);
    execute_sql(&state, &sql, "insert")
}
