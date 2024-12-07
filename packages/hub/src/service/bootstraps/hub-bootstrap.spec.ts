import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { subscribeHub } from "./hub-bootstrap";
import { atom } from "nanostores";
import { Hub } from "../../hub/hub";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("subscribeHub", () => {
  const a = spyOn(Hub, "from");

  afterEach(() => {
    a.mockClear();
  });

  beforeEach(() => {
    let i = 0;
    a.mockImplementation(
      // @ts-ignore
      async () => {
        await sleep(20);
        return `hub-${i++}`;
      },
    );
  });

  it("should call listener once with the correct hub", async () => {
    const listener = mock();
    const hubSchemaAtom = atom<any>(null);
    const hub = await subscribeHub(hubSchemaAtom);

    hub.listen((value) => listener(value));

    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 10);

    await sleep(100);

    expect(listener).toBeCalled();
    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith("hub-1");
  });

  it("should call listener twice with the correct hubs", async () => {
    const listener = mock();
    const hubSchemaAtom = atom<any>(null);
    const hub = await subscribeHub(hubSchemaAtom);

    hub.listen((value) => listener(value));

    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);

    await sleep(100);

    expect(listener).toBeCalled();
    expect(listener).toBeCalledTimes(2);
    expect(listener).toBeCalledWith("hub-1");
    expect(listener).toBeCalledWith("hub-2");
  });

  it("should call listener only twice even with multiple sets", async () => {
    const listener = mock();
    const hubSchemaAtom = atom<any>(null);
    const hub = await subscribeHub(hubSchemaAtom);

    hub.listen((value) => listener(value));

    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);

    await sleep(100);

    expect(listener).toBeCalled();
    expect(listener).toBeCalledTimes(2);
    expect(listener).toBeCalledWith("hub-1");
    expect(listener).toBeCalledWith("hub-2");
  });

  it("should call listener four times with the correct hubs with delays", async () => {
    const listener = mock();
    const hubSchemaAtom = atom<any>(null);
    const hub = await subscribeHub(hubSchemaAtom);

    hub.listen((value) => listener(value));

    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    await sleep(25);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);
    await sleep(25);
    setTimeout(() => {
      hubSchemaAtom.set({});
    }, 0);

    await sleep(100);

    expect(listener).toBeCalled();
    expect(listener).toBeCalledTimes(4);
    expect(listener).toBeCalledWith("hub-1");
    expect(listener).toBeCalledWith("hub-2");
    expect(listener).toBeCalledWith("hub-3");
    expect(listener).toBeCalledWith("hub-4");
  });
});
