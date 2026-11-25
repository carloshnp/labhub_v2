use std::time::Duration;
use rusb::{Context, DeviceHandle, UsbContext};

const XFERSIZE: usize = 64;
const INTERFACE: u8 = 0;
const WRITE_EP: u8 = 0x01;
const READ_EP: u8 = 0x81;
const VENDOR_ID: u16 = 0x1180;
const PRODUCT_ID: u16 = 0x0012;

pub struct Cornerstone {
    device_handle: Option<DeviceHandle<Context>>,
    timeout: Duration
}

impl Cornerstone {
    pub fn new(timeout: Duration) -> Self {
        Cornerstone {
            device_handle: None,
            timeout,
        }
    }

    pub fn connect(&mut self) -> bool {
        let context = match Context::new() {
            Ok(ctx) => ctx,
            Err(e) => {
                println!("Failed to create USB context: {}", e);
                return false;
            }
        };

        let devices = match context.devices() {
            Ok(devs) => devs,
            Err(e) => {
                println!("Failed to enumerate USB devices: {}", e);
                return false;
            }
        };

        for device in devices.iter() {
            let device_desc = match device.device_descriptor() {
                Ok(desc) => desc,
                Err(_) => continue,
            };

            println!("Scanning device - Vendor ID: 0x{:04X}, Product ID: 0x{:04X} (Looking for: Vendor ID: 0x{:04X}, Product ID: 0x{:04X})",
                device_desc.vendor_id(), device_desc.product_id(), VENDOR_ID, PRODUCT_ID);

            if device_desc.vendor_id() == VENDOR_ID && device_desc.product_id() == PRODUCT_ID {
                match device.open() {
                    Ok(handle) => {
                        // Reset the device
                        if let Err(e) = handle.reset() {
                            println!("Warning: Failed to reset device: {}", e);
                        }

                        // Detach kernel driver if necessary (mainly for Linux)
                        #[cfg(target_os = "linux")]
                        {
                            if handle.kernel_driver_active(INTERFACE).unwrap_or(false) {
                                handle.detach_kernel_driver(INTERFACE).ok();
                            }
                        }

                        // Claim interface
                        match handle.claim_interface(INTERFACE) {
                            Ok(_) => {
                                self.device_handle = Some(handle);
                                println!("Device connected: Vendor ID: {}, Product ID: {}", VENDOR_ID, PRODUCT_ID);
                                return true;
                            }
                            Err(e) => {
                                println!("Failed to claim interface: {}", e);
                                continue;
                            }
                        }
                    }
                    Err(e) => {
                        println!("Failed to open device: {}", e);
                        continue;
                    }
                }
            }
        }

        println!("Failed to connect to the device.");
        false
    }

    pub fn disconnect(&mut self) {
        if let Some(handle) = self.device_handle.take() {
            // Release the interface before disconnecting
            if let Err(e) = handle.release_interface(INTERFACE) {
                println!("Warning: Failed to release interface: {}", e);
            }
            
            #[cfg(target_os = "linux")]
            {
                // Reattach kernel driver if necessary
                handle.attach_kernel_driver(INTERFACE).ok();
            }
        }
        println!("Device disconnected.");
    }

    pub fn send_command(&mut self, command: &str) -> bool {
        if let Some(handle) = &self.device_handle {
            let mut data = command.as_bytes().to_vec();
            data.push(b'\r');  // Add carriage return
            data.push(b'\n');  // Add line feed

            match handle.write_bulk(WRITE_EP, &data, self.timeout) {
                Ok(written) => {
                    if written == data.len() {
                        println!("Command sent successfully: {}", command);
                        // Add a small delay to ensure the device processes the command
                        std::thread::sleep(Duration::from_millis(50));
                        return true;
                    } else {
                        println!("Incomplete write: {} of {} bytes", written, data.len());
                    }
                }
                Err(e) => {
                    println!("Failed to send command: {} - Error: {}", command, e);
                }
            }
        }
        false
    }

    pub fn get_response(&mut self) -> String {
        if let Some(handle) = &self.device_handle {
            // Wait for device to process previous command
            std::thread::sleep(Duration::from_millis(100));
            
            let mut buffer = vec![0; XFERSIZE];
            
            // Try multiple times to get a response
            for _ in 0..3 {
                match handle.read_bulk(READ_EP, &mut buffer, self.timeout) {
                    Ok(size) => {
                        let response = String::from_utf8_lossy(&buffer[..size])
                            .replace('\r', "")
                            .replace('\n', "")
                            .replace('\0', "")
                            .trim()
                            .to_string();

                        if !response.is_empty() {
                            println!("Response received: {}", response);
                            return response;
                        }
                        std::thread::sleep(Duration::from_millis(50));
                    }
                    Err(e) => {
                        println!("Failed to read response: {}", e);
                        std::thread::sleep(Duration::from_millis(50));
                    }
                }
            }
            "0".to_string()
        } else {
            "0".to_string()
        }
    }

    pub fn get_double_response_from_command(&mut self, command: &str) -> Option<f64> {
        if !self.send_command(command) {
            return Some(0.0);
        }
        let response = self.get_response();
        response.trim().parse::<f64>().ok().or(Some(0.0))
    }

    pub fn get_string_response_from_command(&mut self, command: &str) -> String {
        if !self.send_command(command) {
            return "0".to_string();
        }
        let response = self.get_response();
        if response.is_empty() {
            "0".to_string()
        } else {
            response
        }
    }

    pub fn get_status_byte(&mut self) -> Option<u8> {
        let response = self.get_string_response_from_command("STATUS?");
        u8::from_str_radix(response.trim(), 16).ok().or(Some(0))  // Return 0 if parse fails
    }

    pub fn set_wavelength(&mut self, wavelength: f64) -> bool {
        self.send_command(&format!("GOWAVE {:.3}", wavelength))
    }

    pub fn get_wavelength(&mut self) -> Option<f64> {
        self.get_double_response_from_command("WAVE?")
    }

    pub fn get_grating(&mut self) -> String {
        std::thread::sleep(Duration::from_millis(300));
        loop {
            let stb = self.get_string_response_from_command("GRAT?");
            if stb != "0" && stb != "00" {
                let first_char = stb.chars().next().unwrap_or('0').to_string();
                return first_char;
            }
        }
    }

    pub fn set_grating(&mut self, grating: i32) -> bool {
        let grat_val = self.get_grating();
        println!("Grating value: {}", grat_val);
        self.send_command(&format!("GRAT {}", grating))
    }
}