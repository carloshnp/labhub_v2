use crate::api::controllers::monochromator::Cornerstone;
use crate::api::controllers::lockin::LockInSR860;
use std::sync::Mutex;

// LockInSR860 Commands
#[tauri::command]
pub fn connect_lockin(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<(), String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.connect().map_err(|e| format!("Visa error: {}", e))
}

#[tauri::command]
pub fn disconnect_lockin(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<(), String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.disconnect().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_lockin(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.get_lockin().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_r_value(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.get_r_value().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_sensitivity(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.get_sensitivity().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_sensitivity(lockin: tauri::State<Mutex<LockInSR860>>, sensitivity: String) -> Result<(), String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.set_sensitivity(&sensitivity).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_time_constant(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.get_time_constant().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_time_constant(lockin: tauri::State<Mutex<LockInSR860>>, time_constant: String) -> Result<(), String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.set_time_constant(&time_constant).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_overload(lockin: tauri::State<Mutex<LockInSR860>>) -> Result<String, String> {
    let mut lockin_guard = lockin.lock().map_err(|e| format!("Visa error: {}", e))?;
    lockin_guard.get_overload().map_err(|e| e.to_string())
}

// Monochromator Commands
#[tauri::command]
pub fn connect_monochromator(mono: tauri::State<Mutex<Cornerstone>>) -> bool {
    mono.lock().unwrap().connect()
}

#[tauri::command]
pub fn disconnect_monochromator(mono: tauri::State<Mutex<Cornerstone>>) {
    mono.lock().unwrap().disconnect()
}

#[tauri::command]
pub fn send_command(mono: tauri::State<Mutex<Cornerstone>>, command: String) -> bool {
    mono.lock().unwrap().send_command(&command)
}

#[tauri::command]
pub fn get_response(mono: tauri::State<Mutex<Cornerstone>>) -> String {
    mono.lock().unwrap().get_response()
}

#[tauri::command]
pub fn get_wavelength(mono: tauri::State<Mutex<Cornerstone>>) -> Option<f64> {
    mono.lock().unwrap().get_wavelength()
}

#[tauri::command]
pub fn set_wavelength(mono: tauri::State<Mutex<Cornerstone>>, wavelength: f64) -> bool {
    mono.lock().unwrap().set_wavelength(wavelength)
}

#[tauri::command]
pub fn get_grating(mono: tauri::State<Mutex<Cornerstone>>) -> String {
    mono.lock().unwrap().get_grating()
}

#[tauri::command]
pub fn set_grating(mono: tauri::State<Mutex<Cornerstone>>, grating: i32) -> bool {
    mono.lock().unwrap().set_grating(grating)
}

#[tauri::command]
pub fn get_status_byte(mono: tauri::State<Mutex<Cornerstone>>) -> Option<u8> {
    mono.lock().unwrap().get_status_byte()
}
