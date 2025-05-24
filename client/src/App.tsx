import { Toaster } from "react-hot-toast";
import { UserProvider } from "./contexts/userContext";
import { GroupProvider } from "./contexts/groupContext";
import { SocketProvider } from "./contexts/socketContext";
import ChatLayout from "./layouts/ChatLayout";

function App() {
  return (
    <UserProvider>
      <GroupProvider>
        <SocketProvider>
          <ChatLayout />
          <Toaster />
        </SocketProvider>
      </GroupProvider>
    </UserProvider>
  );
}

export default App;
