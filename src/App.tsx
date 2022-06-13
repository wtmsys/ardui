import { useRef, useState } from "react";
import "./styles.css";

const encoder = new TextEncoder();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const device = useRef<USBDevice>(null);

  const onClick = async () => {
    device.current = await navigator.usb.requestDevice({ filters: [] });

    if (device.current === null) {
      return;
    }

    await device.current.open();
    await device.current.selectConfiguration(1);
    await device.current.claimInterface(2);
    await device.current.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: 0x22,
      value: 0x01,
      index: 0x02
    });

    console.log(device.current);

    if (device.current.open) {
      setIsConnected(true);
    }

    device.current.transferIn(5, 64).then((result) => {
      const decoder = new TextDecoder();
      console.log("Received: " + decoder.decode(result.data));
    });
  };

  const onTurnOnLed = async () => {
    if (device.current) {
      await device.current.transferOut(4, encoder.encode("q"));

      device.current.transferIn(5, 64).then((result) => {
        const decoder = new TextDecoder();
        console.log("Received: " + decoder.decode(result.data));
      });
    }
  };

  const onTurnOffLed = async () => {
    if (device.current) {
      await device.current.transferOut(4, encoder.encode("w"));

      device.current.transferIn(5, 64).then((result) => {
        const decoder = new TextDecoder();
        console.log("Received: " + decoder.decode(result.data));
      });
    }
  };

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>

      <button onClick={onClick}>Connect</button>

      {isConnected && <button onClick={onTurnOnLed}>Turn on LED</button>}
      {isConnected && <button onClick={onTurnOffLed}>Turn off LED</button>}
    </div>
  );
}
