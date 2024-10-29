// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_context, Builder};
use std::sync::Mutex;
use crate::api::controllers::monochromator::Monochromator;
use crate::api::controllers::lockin::LockInSR860;
use crate::api::commands::*;

mod api;

fn main() {
    Builder::default()
        .manage(Mutex::new(Monochromator::new()))
        .manage(Mutex::new(LockInSR860::new()))
        .invoke_handler(tauri::generate_handler![
            connect_lockin,
            get_lockin,
            get_r_value,
            get_sensitivity,
            set_sensitivity,
            get_time_constant,
            set_time_constant,
            get_overload,
            connect_monochromator,
            get_mono,
            get_wavelength,
            set_wavelength,
            get_grat,
            set_grat,
            get_status_byte,
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}