// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Builder, generate_context, generate_handler};
use std::sync::Mutex;
use std::time::Duration;
use crate::api::controllers::monochromator::Cornerstone;
use crate::api::controllers::lockin::LockInSR860;

pub mod api;

fn main() {
    Builder::default()
        .manage(Mutex::new(Cornerstone::new(Duration::from_secs(1))))
        .manage(Mutex::new(LockInSR860::new().expect("Failed to initialize LockInSR860")))
        .invoke_handler(generate_handler![
            api::commands::connect_monochromator,
            api::commands::disconnect_monochromator,
            api::commands::send_command,
            api::commands::get_response,
            api::commands::get_wavelength,
            api::commands::set_wavelength,
            api::commands::get_grating,
            api::commands::set_grating,
            api::commands::get_status_byte,
            api::commands::connect_lockin,
            api::commands::disconnect_lockin,
            api::commands::get_lockin,
            api::commands::get_r_value,
            api::commands::get_sensitivity,
            api::commands::set_sensitivity,
            api::commands::get_time_constant,
            api::commands::set_time_constant,
            api::commands::get_overload,
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}