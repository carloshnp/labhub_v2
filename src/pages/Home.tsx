import { MonochromatorControl } from "./components/equipments/MonochromatorControl";
import { LockInControl } from "./components/equipments/LockInControl";
import { TopBar } from "./components/TopBar";
import { WavelengthIterator } from "./components/equipments/WavelengthIterator";

function Home() {
  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex w-full h-full p-4 gap-4 overflow-auto bg-zinc-900">
          <MonochromatorControl />
          <LockInControl />
          <WavelengthIterator />
      </div>
    </div>
  )
}

export default Home;