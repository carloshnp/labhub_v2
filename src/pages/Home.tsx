import { EquipmentContainer } from "./components/equipments/EquipmentContainer";
import { MonochromatorControl } from "./components/equipments/MonochromatorControl";

function Home() {
  return (
    <div className="h-full flex-grow">
      <div className="flex w-full h-full p-4 overflow-auto bg-zinc-800">
        <EquipmentContainer>
          <MonochromatorControl />
        </EquipmentContainer>
      </div>
    </div>
  );
}

export default Home;