use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::time::Duration;
use visa_rs::prelude::*;
use visa_rs::VisaString;

pub struct LockInSR860 {
    lock_in: Option<Instrument>,
    time_constant_dict: HashMap<&'static str, u32>,
    sensitivity_dict: HashMap<&'static str, u32>,
}

impl LockInSR860 {
    pub fn new() -> LockInSR860 {
        // Initialize the dictionaries for time constants and sensitivities
        let mut time_constant_dict = HashMap::new();
        // Time constant settings
        time_constant_dict.insert("1 μs", 0);
        time_constant_dict.insert("3 μs", 1);
        time_constant_dict.insert("10 μs", 2);
        time_constant_dict.insert("30 μs", 3);
        time_constant_dict.insert("100 μs", 4);
        time_constant_dict.insert("300 μs", 5);
        time_constant_dict.insert("1 ms", 6);
        time_constant_dict.insert("3 ms", 7);
        time_constant_dict.insert("10 ms", 8);
        time_constant_dict.insert("30 ms", 9);
        time_constant_dict.insert("100 ms", 10);
        time_constant_dict.insert("300 ms", 11);
        time_constant_dict.insert("1 s", 12);
        time_constant_dict.insert("3 s", 13);
        time_constant_dict.insert("10 s", 14);
        time_constant_dict.insert("30 s", 15);
        time_constant_dict.insert("100 s", 16);
        time_constant_dict.insert("300 s", 17);
        time_constant_dict.insert("1 ks", 18);
        time_constant_dict.insert("3 ks", 19);
        time_constant_dict.insert("10 ks", 20);
        time_constant_dict.insert("30 ks", 21);

        let mut sensitivity_dict = HashMap::new();
        // Sensitivity settings
        sensitivity_dict.insert("1 V", 0);
        sensitivity_dict.insert("500 mV", 1);
        sensitivity_dict.insert("200 mV", 2);
        sensitivity_dict.insert("100 mV", 3);
        sensitivity_dict.insert("50 mV", 4);
        sensitivity_dict.insert("20 mV", 5);
        sensitivity_dict.insert("10 mV", 6);
        sensitivity_dict.insert("5 mV", 7);
        sensitivity_dict.insert("2 mV", 8);
        sensitivity_dict.insert("1 mV", 9);
        sensitivity_dict.insert("500 μV", 10);
        sensitivity_dict.insert("200 μV", 11);
        sensitivity_dict.insert("100 μV", 12);
        sensitivity_dict.insert("50 μV", 13);
        sensitivity_dict.insert("20 μV", 14);
        sensitivity_dict.insert("10 μV", 15);
        sensitivity_dict.insert("5 μV", 16);
        sensitivity_dict.insert("2 μV", 17);
        sensitivity_dict.insert("1 μV", 18);
        sensitivity_dict.insert("500 nV", 19);
        sensitivity_dict.insert("200 nV", 20);
        sensitivity_dict.insert("100 nV", 21);
        sensitivity_dict.insert("50 nV", 22);
        sensitivity_dict.insert("20 nV", 23);
        sensitivity_dict.insert("10 nV", 24);
        sensitivity_dict.insert("5 nV", 25);
        sensitivity_dict.insert("2 nV", 26);
        sensitivity_dict.insert("1 nV", 27);

        LockInSR860 {
            lock_in: None,
            time_constant_dict,
            sensitivity_dict,
        }
    }

    // Connect to the device
    pub fn connect(&mut self) -> visa_rs::Result<()> {
        // Create a Default ResourceManager
        let rm = DefaultRM::new()?;

        // Expression to match the specific resource
        let expr = VisaString::from_string("GPIB0::4::INSTR".to_string())
            .ok_or_else(|| visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))?;

        // Find the resource
        let res = rm.find_res(&expr)?;

        let instrument = rm.open(
            &res, 
            AccessMode::NO_LOCK, 
            Duration::from_secs(5))?;
        self.lock_in = Some(instrument);
        Ok(())
    }

    // Helper method for querying the instrument
    fn instrument_query(&self, cmd: &str) -> Result<String> {
        if let Some(ref instrument) = self.lock_in {
            // Send the command
            (&*instrument).write_all(format!("{}\n", cmd).as_bytes()).map_err(io_to_vs_err)?;
            (&*instrument).flush().map_err(io_to_vs_err)?;
    
            // Read the response
            let mut buf_reader = BufReader::new(&*instrument);
            let mut response = String::new();
            buf_reader.read_line(&mut response).map_err(io_to_vs_err)?;
    
            Ok(response.trim().to_string())
        } else {
            Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
        }
    }
    
    // Helper method for writing commands to the instrument
    fn instrument_write(&self, cmd: &str) -> Result<()> {
        if let Some(ref instrument) = self.lock_in {
            // Send the command
            (&*instrument).write_all(format!("{}\n", cmd).as_bytes()).map_err(io_to_vs_err)?;
            (&*instrument).flush().map_err(io_to_vs_err)?;
            Ok(())
        } else {
            Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
        }
    }

    // Get Lock-In device name
    pub fn get_lockin(&self) -> Result<String> {
        self.instrument_query("*IDN?")
    }

    // Get current value of R
    pub fn get_r_value(&self) -> Result<String> {
        self.instrument_query("OUTP? 2")
    }

    // Get current sensitivity
    pub fn get_sensitivity(&self) -> visa_rs::Result<String> {
        let response = self.instrument_query("SCAL?")?;
        let sensitivity_index: u32 = response.trim().parse().map_err(|_| {
            visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr)
        })?;
        // Find the corresponding sensitivity setting
        for (key, &value) in &self.sensitivity_dict {
            if value == sensitivity_index {
                return Ok(key.to_string());
            }
        }
        Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
    }

    // Set sensitivity
    pub fn set_sensitivity(&self, sensitivity: &str) -> visa_rs::Result<()> {
        if let Some(&sensitivity_value) = self.sensitivity_dict.get(sensitivity) {
            // Send the command to set the sensitivity
            let cmd = format!("SCAL {}", sensitivity_value);
            self.instrument_write(&cmd)
        } else {
            Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
        }
    }

    // Get time constant
    pub fn get_time_constant(&self) -> visa_rs::Result<String> {
        let response = self.instrument_query("OFLT?")?;
        let time_constant_index: u32 = response.trim().parse().map_err(|_| {
            visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr)
        })?;
        // Find the corresponding time constant setting
        for (key, &value) in &self.time_constant_dict {
            if value == time_constant_index {
                return Ok(key.to_string());
            }
        }
        Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
    }

    // Set time constant
    pub fn set_time_constant(&self, time_constant: &str) -> visa_rs::Result<()> {
        if let Some(&time_constant_value) = self.time_constant_dict.get(time_constant) {
            // Send the command to set the time constant
            let cmd = format!("OFLT {}", time_constant_value);
            self.instrument_write(&cmd)
        } else {
            Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
        }
    }

    // Get overload status
    pub fn get_overload(&self) -> Result<String> {
        self.instrument_query("LIAS? 0")
    }
}
