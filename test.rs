use std::time::Duration;
use rusb::{Context, DeviceHandle, UsbContext};

const XFERSIZE: usize = 64;

pub struct Cornerstone {
    device_handle: Option<DeviceHandle<Context>>,
    vendor_id: u16,
    product_id: u16,
    timeout: Duration,
    last_message: String,
}

impl Cornerstone {
    pub fn new(vendor_id: u16, product_id: u16, timeout: Duration) -> Self {
        Cornerstone {
            device_handle: None,
            vendor_id,
            product_id,
            timeout,
            last_message: String::new(),
        }
    }

    pub fn connect(&mut self) -> bool {
        let context = Context::new().unwrap();
        let devices = context.devices().unwrap();

        for device in devices.iter() {
            let device_desc = device.device_descriptor().unwrap();

            if device_desc.vendor_id() == self.vendor_id && device_desc.product_id() == self.product_id {
                self.device_handle = device.open().ok();
                if self.device_handle.is_some() {
                    println!("Device connected: Vendor ID: {}, Product ID: {}", self.vendor_id, self.product_id);
                    return true;
                }
            }
        }

        println!("Failed to connect to the device.");
        false
    }

    pub fn disconnect(&mut self) {
        self.device_handle = None;
        println!("Device disconnected.");
    }

    pub fn send_command(&mut self, command: &str) -> bool {
        if let Some(handle) = &self.device_handle {
            let mut data = command.as_bytes().to_vec();
            data.push(b'\n');

            if handle.write_bulk(0x01, &data, self.timeout).is_ok() {
                println!("Command sent successfully: {}", command);
                return true;
            }
        }

        println!("Failed to send command: {}", command);
        false
    }

    pub fn get_response(&mut self) -> String {
        if let Some(handle) = &self.device_handle {
            let mut buffer = vec![0; XFERSIZE];

            if let Ok(size) = handle.read_bulk(0x81, &mut buffer, self.timeout) {
                let response = String::from_utf8_lossy(&buffer[..size])
                    .replace('\r', "")
                    .replace('\n', "")
                    .replace('\0', "")
                    .trim()
                    .to_string();

                println!("Response received: {}", response);
                return response;
            }
        }

        String::new()
    }

    pub fn get_double_response_from_command(&mut self, command: &str) -> Option<f64> {
        self.send_command(command);
        let response = self.get_response();

        response.trim().parse::<f64>().ok()
    }

    pub fn get_string_response_from_command(&mut self, command: &str) -> String {
        self.send_command(command);
        self.get_response()
    }

    pub fn get_status_byte(&mut self) -> Option<u8> {
        let response = self.get_string_response_from_command("STATUS?");
        u8::from_str_radix(response.trim(), 16).ok()
    }

    pub fn set_wavelength(&mut self, wavelength: f64) -> bool {
        self.send_command(&format!("GOWAVE {:.3}", wavelength))
    }

    pub fn get_wavelength(&mut self) -> Option<f64> {
        self.get_double_response_from_command("WAVE?")
    }

    pub fn get_grating(&mut self) -> String {
        self.get_string_response_from_command("GRAT?")
    }

    pub fn set_grating(&mut self, grating: i32) -> bool {
        self.send_command(&format!("GRAT {}", grating))
    }
}

fn main() {
    let mut cornerstone = Cornerstone::new(0x1180, 0x0012, Duration::from_secs(1));

    if cornerstone.connect() {
        println!("Connected to the device.");

        if let Some(wavelength) = cornerstone.get_wavelength() {
            println!("Current Wavelength: {:.3}", wavelength);
        } else {
            println!("Failed to get wavelength.");
        }

        if cornerstone.set_wavelength(532.0) {
            println!("Wavelength set to 532.0");
        } else {
            println!("Failed to set wavelength.");
        }

        println!("Current Grating: {}", cornerstone.get_grating());

        if cornerstone.set_grating(2) {
            println!("Grating set to 2");
        } else {
            println!("Failed to set grating.");
        }

        if let Some(status) = cornerstone.get_status_byte() {
            println!("Status Byte: 0x{:02X}", status);
        } else {
            println!("Failed to get status byte.");
        }

        cornerstone.disconnect();
    }
}

main();