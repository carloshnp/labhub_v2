#[cfg(feature = "visa")]
mod implementation {
    use std::io::Read;
    use std::{collections::HashMap, io::Write};
    use std::time::Duration;
    use visa_rs::{
        enums::status::ErrorCode, prelude::*, Error as VisaError, VisaString
    };

    pub struct LockInSR860 {
        rm: DefaultRM,
        lock_in: Option<Instrument>,
        time_constant_dict: HashMap<&'static str, u32>,
        sensitivity_dict: HashMap<&'static str, u32>,
    }

    impl LockInSR860 {
        pub fn new() -> visa_rs::Result<Self> {
            let time_constant_dict = HashMap::from([
                ("1 μs", 0), ("3 μs", 1), ("10 μs", 2), ("30 μs", 3),
                ("100 μs", 4), ("300 μs", 5), ("1 ms", 6), ("3 ms", 7),
                ("10 ms", 8), ("30 ms", 9), ("100 ms", 10), ("300 ms", 11),
                ("1 s", 12), ("3 s", 13), ("10 s", 14), ("30 s", 15),
                ("100 s", 16), ("300 s", 17), ("1 ks", 18), ("3 ks", 19),
                ("10 ks", 20), ("30 ks", 21),
            ]);

            let sensitivity_dict = HashMap::from([
                ("1 V", 0), ("500 mV", 1), ("200 mV", 2), ("100 mV", 3),
                ("50 mV", 4), ("20 mV", 5), ("10 mV", 6), ("5 mV", 7),
                ("2 mV", 8), ("1 mV", 9), ("500 μV", 10), ("200 μV", 11),
                ("100 μV", 12), ("50 μV", 13), ("20 μV", 14), ("10 μV", 15),
                ("5 μV", 16), ("2 μV", 17), ("1 μV", 18), ("500 nV", 19),
                ("200 nV", 20), ("100 nV", 21), ("50 nV", 22), ("20 nV", 23),
                ("10 nV", 24), ("5 nV", 25), ("2 nV", 26), ("1 nV", 27),
            ]);

            let rm = DefaultRM::new()?;
            Ok(LockInSR860 {
                rm,
                lock_in: None,
                time_constant_dict,
                sensitivity_dict,
            })
        }

        pub fn connect(&mut self) -> visa_rs::Result<()> {
            let addr = VisaString::from_string("GPIB0::4::INSTR".to_string()).ok_or(VisaError::from(ErrorCode::ErrorSystemError))?;
            println!("addr: {}", addr);

            let instrument = self.rm.open(&addr, AccessMode::NO_LOCK, Duration::from_secs(1))?;
            println!("instrument: {:?}", instrument);
            self.lock_in = Some(instrument);
            Ok(())
        }

        fn instrument_query(&mut self, cmd: &str) -> visa_rs::Result<String> {
            if let Some(ref mut instrument) = self.lock_in {
                let cmd = VisaString::from_string(format!("{}\n", cmd)).ok_or(VisaError::from(ErrorCode::ErrorSystemError))?;

                instrument.write_all(&cmd.as_bytes()).map_err(io_to_vs_err)?;

                let mut buffer = vec![0u8; 256];

                let count = instrument.read(&mut buffer).map_err(io_to_vs_err)?;

                String::from_utf8(buffer[..count].to_vec())
                    .map(|s| s.trim().to_string())
                    .map_err(|_| VisaError::from(ErrorCode::ErrorSystemError))
            } else {
                Err(VisaError::from(ErrorCode::ErrorSystemError))
            }
        }

        fn instrument_write(&mut self, cmd: &str) -> visa_rs::Result<()> {
            if let Some(ref mut instrument) = self.lock_in {
                let cmd = VisaString::from_string(format!("{}\n", cmd)).ok_or(VisaError::from(ErrorCode::ErrorSystemError))?;
                instrument.write_all(&cmd.as_bytes()).map_err(io_to_vs_err)
            } else {
                Err(VisaError::from(ErrorCode::ErrorSystemError))
            }
        }

        pub fn get_lockin(&mut self) -> visa_rs::Result<String> {
            self.instrument_query("*IDN?")
        }

        pub fn get_r_value(&mut self) -> visa_rs::Result<String> {
            self.instrument_query("OUTP? 2")
        }

        pub fn get_sensitivity(&mut self) -> visa_rs::Result<String> {
            let response = self.instrument_query("SCAL?")?;
            let sensitivity_index: u32 = response.trim().parse()
                .map_err(|_|VisaError::from(ErrorCode::ErrorInvLine))?;

            self.sensitivity_dict
                .iter()
                .find(|(_, &value)| value == sensitivity_index)
                .map(|(key, _)| key.to_string())
                .ok_or_else(|| VisaError::from(ErrorCode::ErrorInvRsrcName))
        }

        pub fn set_sensitivity(&mut self, sensitivity: &str) -> visa_rs::Result<()> {
            let sensitivity_value = self.sensitivity_dict.get(sensitivity)
                .ok_or_else(|| VisaError::from(ErrorCode::ErrorInvLine))?;

            self.instrument_write(&format!("SCAL {}", sensitivity_value))
        }

        pub fn get_time_constant(&mut self) -> visa_rs::Result<String> {
            let response = self.instrument_query("OFLT?")?;
            let time_constant_index: u32 = response.trim().parse()
                .map_err(|_| VisaError::from(ErrorCode::ErrorInvLine))?;

            self.time_constant_dict
                .iter()
                .find(|(_, &value)| value == time_constant_index)
                .map(|(key, _)| key.to_string())
                .ok_or_else(|| VisaError::from(ErrorCode::ErrorInvRsrcName))
        }

        pub fn set_time_constant(&mut self, time_constant: &str) -> visa_rs::Result<()> {
            let time_constant_value = self.time_constant_dict.get(time_constant)
                .ok_or_else(|| VisaError::from(ErrorCode::ErrorInvLine))?;

            self.instrument_write(&format!("OFLT {}", time_constant_value))
        }

        pub fn get_overload(&mut self) -> visa_rs::Result<String> {
            self.instrument_query("LIAS? 2")
        }

        pub fn disconnect(&mut self) -> visa_rs::Result<()> {
            self.lock_in = None;
            Ok(())
        }
    }
}

#[cfg(not(feature = "visa"))]
mod implementation {
    const VISA_DISABLED_MSG: &str =
        "NI-VISA support is disabled (built without the `visa` feature). Run with `--features visa` to enable Lock-In SR860 hardware access.";

    pub struct LockInSR860;

    impl LockInSR860 {
        pub fn new() -> Result<Self, String> {
            Ok(LockInSR860)
        }

        pub fn connect(&mut self) -> Result<(), String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn disconnect(&mut self) -> Result<(), String> {
            Ok(())
        }

        pub fn get_lockin(&mut self) -> Result<String, String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn get_r_value(&mut self) -> Result<String, String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn get_sensitivity(&mut self) -> Result<String, String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn set_sensitivity(&mut self, _sensitivity: &str) -> Result<(), String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn get_time_constant(&mut self) -> Result<String, String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn set_time_constant(&mut self, _time_constant: &str) -> Result<(), String> {
            Err(VISA_DISABLED_MSG.to_string())
        }

        pub fn get_overload(&mut self) -> Result<String, String> {
            Err(VISA_DISABLED_MSG.to_string())
        }
    }
}

pub use implementation::LockInSR860;
