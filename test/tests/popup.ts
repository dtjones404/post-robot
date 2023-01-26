import { send, bridge } from "../../src";
import { awaitWindowHello } from "../../src/lib";
import { enableIE8Mode, createPopup, getWindows } from "../common";

describe("Popup cases", () => {
  it("should work with a popup window", () => {
    const { childWindow } = getWindows();
    return send(childWindow, "setupListener", {
      messageName: "foo",
      data: {
        foo: "bar",
      },
    }).then(() => {
      return send(childWindow, "foo").then(({ data }) => {
        if (data.foo !== "bar") {
          throw new Error(`Expected data.foo to be 'bar', got ${data.foo}`);
        }
      });
    });
  });

  it("should succeed messaging popup when emulating IE", () => {
    const ie8mode = enableIE8Mode();

    if (!bridge) {
      throw new Error(`Bridge not found`);
    }

    return bridge
      .openBridge("/base/test/bridge.htm", "mock://test-post-robot-child.com")
      .then(() => {
        const ie8Window = createPopup("child.htm");
        // @ts-expect-error ie8Window can be null
        return awaitWindowHello(ie8Window)
          .then(() => {
            // @ts-expect-error ie8Window can be null
            return send(ie8Window, "setupListener", {
              messageName: "foo",
              data: {
                foo: "bar",
              },
            });
          })
          .then(() => {
            // @ts-expect-error ie8Window can be null
            return send(ie8Window, "foo");
          })
          .then(() => {
            // @ts-expect-error ie8Window can be null
            ie8Window.close();
            ie8mode.cancel();
          });
      });
  });
});