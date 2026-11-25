use std::time::Duration;

pub struct MockCornerstone {
    connected: bool,
    vendor_id: u16,
    product_id: u16,
    timeout: Duration,
    last_message: String,
    current_wavelength: f64,
    current_grating: i32,
}

impl MockCornerstone {
    pub fn new(vendor_id: u16, product_id: u16, timeout: Duration) -> Self {
        MockCornerstone {
            connected: false,
            vendor_id,
            product_id,
            timeout,
            last_message: String::new(),
            current_wavelength: 500.0, // Default wavelength in nm
            current_grating: 1,
        }
    }

    pub fn connect(&mut self) -> bool {
        // Simulate successful connection if vendor_id and product_id match expected values
        if self.vendor_id == 0x1180 && self.product_id == 0x0010 {
            self.connected = true;
            println!("Mock device connected: Vendor ID: {}, Product ID: {}", self.vendor_id, self.product_id);
            true
        } else {
            println!("Failed to connect to mock device.");
            false
        }
    }

    pub fn disconnect(&mut self) {
        self.connected = false;
        println!("Mock device disconnected.");
    }

    pub fn send_command(&mut self, command: &str) -> bool {
        if !self.connected {
            return false;
        }
        self.last_message = command.to_string();
        true
    }

    pub fn get_response(&mut self) -> String {
        if !self.connected {
            return String::from("ERR: Not connected");
        }
        match self.last_message.as_str() {
            "?NM" => format!("{:.1}", self.current_wavelength),
            "?GRATING" => format!("{}", self.current_grating),
            _ => String::from("OK"),
        }
    }

    pub fn get_double_response_from_command(&mut self, command: &str) -> Option<f64> {
        if !self.connected {
            return None;
        }
        match command {
            "?NM" => Some(self.current_wavelength),
            _ => None,
        }
    }

    pub fn get_string_response_from_command(&mut self, command: &str) -> String {
        if !self.connected {
            return String::from("ERR: Not connected");
        }
        self.get_response()
    }

    pub fn get_status_byte(&mut self) -> Option<u8> {
        if !self.connected {
            return None;
        }
        Some(0) // Mock status byte - 0 indicates no errors
    }

    pub fn set_wavelength(&mut self, wavelength: f64) -> bool {
        if !self.connected {
            return false;
        }
        if wavelength >= 0.0 && wavelength <= 1500.0 {
            self.current_wavelength = wavelength;
            true
        } else {
            false
        }
    }

    pub fn get_wavelength(&mut self) -> Option<f64> {
        if !self.connected {
            return None;
        }
        Some(self.current_wavelength)
    }

    pub fn get_grating(&mut self) -> String {
        if !self.connected {
            return String::from("ERR: Not connected");
        }
        self.current_grating.to_string()
    }

    pub fn set_grating(&mut self, grating: i32) -> bool {
        if !self.connected {
            return false;
        }
        if grating >= 1 && grating <= 3 {
            self.current_grating = grating;
            true
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_connection() {
        let mut mock = MockCornerstone::new(0x1180, 0x0010, Duration::from_secs(1));
        assert!(mock.connect());
        mock.disconnect();
        assert!(!mock.connected);
    }

    #[test]
    fn test_wavelength() {
        let mut mock = MockCornerstone::new(0x1180, 0x0010, Duration::from_secs(1));
        mock.connect();
        
        assert!(mock.set_wavelength(750.0));
        assert_eq!(mock.get_wavelength(), Some(750.0));
        
        // Test invalid wavelength
        assert!(!mock.set_wavelength(1600.0));
    }

    #[test]
    fn test_grating() {
        let mut mock = MockCornerstone::new(0x1180, 0x0010, Duration::from_secs(1));
        mock.connect();
        
        assert!(mock.set_grating(2));
        assert_eq!(mock.get_grating(), "2");
        
        // Test invalid grating
        assert!(!mock.set_grating(4));
    }
}
