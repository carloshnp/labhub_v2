- Must install WinUSB to work on Windows
- Must install libusb to work on Linux  


GRAT 1 - 1,600,400
GRAT 2 - 2,600,1000
GRAT 3 - 3,150,4000

CSV - salvar por padrão "wavelength" e "R average"

1. Tentar usar DLL do laser
2. Tentar hackear DLL do laser

Tentar achar maneiras de se comunicar com o Boxcar Integrator


Log: 
"
PS C:\Users\carlo\OneDrive\Documentos\Programming\labhub_v2> npm run app

> labhub@0.2.0 app
> tauri dev

    Running BeforeDevCommand (`npm run dev`)

> labhub@0.2.0 dev
> vite


  VITE v5.4.8  ready in 190 ms

  ➜  Local:   http://localhost:1420/
    Info Watching C:\Users\carlo\OneDrive\Documentos\Programming\labhub_v2\src-tauri for changes...
warning: field `timeout` is never read
 --> src\api\controllers\mock_monochromator.rs:7:5
  |
3 | pub struct MockCornerstone {
  |            --------------- field in this struct
...
7 |     timeout: Duration,
  |     ^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: `labhub` (bin "labhub") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
Scanning device - Vendor ID: 0x1180, Product ID: 0x0012 (Looking for: Vendor ID: 0x1180, Product ID: 0x0012)
Device connected: Vendor ID: 4480, Product ID: 18
Command sent successfully: WAVE?
Response received: 000,1000
Command sent successfully: WAVE?
Response received: 000,1000
Command sent successfully: GRAT?
Response received: 000,1000
000,1000
Command sent successfully: GRAT 1
Command sent successfully: STB?
Response received: 000,1000
Command sent successfully: STB?
Response received: 000,1000
Grating set successfully.
Command sent successfully: GRAT 1
Command sent successfully: STB?
Response received: 1,600,400
Command sent successfully: STB?
Response received: 2657.041
Grating set successfully.
Command sent successfully: GRAT?
Response received: 2657.041
2657.041
Command sent successfully: GRAT?
Response received: 1,600,400
1,600,400
Command sent successfully: GRAT 2
Command sent successfully: STB?
Response received: 000,400
Command sent successfully: STB?
Response received: 000,400
Grating set successfully.
Command sent successfully: GRAT 2
Command sent successfully: STB?
Response received: 000,400
Command sent successfully: STB?
Response received: 000,400
Grating set successfully.
Command sent successfully: GRAT?
Response received: 1,600,400
1,600,400
Command sent successfully: GRAT?
Response received: 1,600,400
1,600,400
Command sent successfully: GRAT 1
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 0
Command sent successfully: STB?
Response received: 000,400
Command sent successfully: STB?
Response received: 000,400
Grating set successfully.
Command sent successfully: GRAT 1
Command sent successfully: STB?
Response received: 000,400
Command sent successfully: STB?
Response received: 000,400
Grating set successfully.
Command sent successfully: GRAT?
Response received: 000,400
000,400
Command sent successfully: GRAT?
Response received: 000,400
000,400
"