#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
pub mod todo;
use todo::*;


fn main() {
    let database = Database::new_init().unwrap();
    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![get_all, insert, update, delete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
