use visa_rs::prelude::*;
use visa_rs::VisaString;
use std::io::{BufRead, BufReader, Write};
use std::time::Duration;

pub struct Monochromator {
    mono: Option<Instrument>,
}

impl Monochromator {
    pub fn new() -> Self {
        Monochromator { mono: None }
    }

    // Connect to the monochromator device
    pub fn connect(&mut self) -> visa_rs::Result<()> {
        // Create a Default ResourceManager
        let rm = DefaultRM::new()?;

        // Expression to match the specific resource
        let expr = VisaString::from_string("GPIB0::4::INSTR".to_string())
            .ok_or_else(|| visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))?;

        // Find the resource
        let res = rm.find_res(&expr)?;

        // Open the instrument
        let instrument = rm.open(&res, AccessMode::NO_LOCK, Duration::from_secs(5))?;
        self.mono = Some(instrument);
        Ok(())
    }

    // Helper method for querying the instrument
    fn instrument_query(&self, cmd: &str) -> visa_rs::Result<String> {
        if let Some(ref instrument) = self.mono {
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
    fn instrument_write(&self, cmd: &str) -> visa_rs::Result<()> {
        if let Some(ref instrument) = self.mono {
            // Send the command
            (&*instrument).write_all(format!("{}\n", cmd).as_bytes()).map_err(io_to_vs_err)?;
            (&*instrument).flush().map_err(io_to_vs_err)?;
            Ok(())
        } else {
            Err(visa_rs::Error::from(visa_rs::enums::status::ErrorCode::ErrorInvExpr))
        }
    }

    pub fn get_mono(&self) -> visa_rs::Result<String> {
        self.instrument_query("*IDN?")
    }

    pub fn get_wavelength(&self) -> visa_rs::Result<String> {
        self.instrument_query("WAVELENGTH?")
    }

    pub fn get_grat(&self) -> visa_rs::Result<String> {
        self.instrument_query("GRATING?")
    }

    pub fn get_status_byte(&self) -> visa_rs::Result<String> {
        self.instrument_query("STATUS?")
    }

    pub fn set_grat(&mut self, grat: i32) -> visa_rs::Result<()> {
        let cmd = format!("SET GRATING {}", grat);
        self.instrument_write(&cmd)
    }

    pub fn set_wavelength(&mut self, wavelength: f64) -> visa_rs::Result<()> {
        let cmd = format!("SET WAVELENGTH {}", wavelength);
        self.instrument_write(&cmd)
    }
}
