use crate::api::controllers::lockin::LockInSR860;
use crate::api::controllers::monochromator::Monochromator;
use std::sync::Mutex;

// LockInSR860 Commands
#[tauri::command]
pub fn connect_lockin(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<(), String> {
    lockin.lock().unwrap().connect().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_lockin(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    lockin.lock().unwrap().get_lockin().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_r_value(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    lockin.lock().unwrap().get_r_value().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_sensitivity(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    lockin.lock().unwrap().get_sensitivity().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_sensitivity(lockin: tauri::State<Mutex<LockInSR860>>, sensitivity: String) -> Result<(), String> {
    lockin.lock().unwrap().set_sensitivity(&sensitivity).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_time_constant(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    lockin.lock().unwrap().get_time_constant().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_time_constant(lockin: tauri::State<Mutex<LockInSR860>>, time_constant: String) -> Result<(), String> {
    lockin.lock().unwrap().set_time_constant(&time_constant).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_overload(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    lockin.lock().unwrap().get_overload().map_err(|e| e.to_string())
}

// Monochromator Commands
#[tauri::command]
pub fn connect_monochromator(mono: tauri::State<Mutex<Monochromator>>) -> Result<(), String> {
    mono.lock().unwrap().connect().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_mono(mono: tauri::State<Mutex<Monochromator>>) -> Result<String, String> {
    mono.lock().unwrap().get_mono().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_wavelength(mono: tauri::State<Mutex<Monochromator>>) -> Result<String, String> {
    mono.lock().unwrap().get_wavelength().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_wavelength(mono: tauri::State<Mutex<Monochromator>>, wavelength: f64) -> Result<(), String> {
    mono.lock().unwrap().set_wavelength(wavelength).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_grat(mono: tauri::State<Mutex<Monochromator>>) -> Result<String, String> {
    mono.lock().unwrap().get_grat().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_grat(mono: tauri::State<Mutex<Monochromator>>, grating: i32) -> Result<(), String> {
    mono.lock().unwrap().set_grat(grating).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_status_byte(mono: tauri::State<Mutex<Monochromator>>) -> Result<String, String> {
    mono.lock().unwrap().get_status_byte().map_err(|e| e.to_string())
}
