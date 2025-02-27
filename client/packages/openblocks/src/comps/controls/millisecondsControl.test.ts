import { evalAndReduce } from "../utils";
import { changeValueAction } from "openblocks-core";
import { millisecondsControl } from "./millisecondControl";

function changeAndExpect(
  comp: InstanceType<ReturnType<typeof millisecondsControl>>,
  value: string,
  expected: number
) {
  const newComp = evalAndReduce(comp.reduce(changeValueAction(value)));
  expect(newComp.getView()).toEqual(expected);
  return newComp;
}

test("test millisecond control", () => {
  let comp = new (millisecondsControl({}))({});
  expect(comp.getView()).toEqual(0);
  comp = changeAndExpect(comp, "5", 5);
  comp = changeAndExpect(comp, "5ms", 5);
  comp = changeAndExpect(comp, "5s", 5000);
  comp = changeAndExpect(comp, "0.5s", 500);
  comp = changeAndExpect(comp, "-1", 0);

  comp = new (millisecondsControl({ right: 1000 }))({});
  expect(comp.getView()).toEqual(0);
  comp = changeAndExpect(comp, "5", 5);
  comp = changeAndExpect(comp, "5ms", 5);
  comp = changeAndExpect(comp, "5s", 1000);
  comp = changeAndExpect(comp, "-1", 0);
  comp = changeAndExpect(comp, "0.5s", 500);
  comp = changeAndExpect(comp, "2000", 1000);

  comp = new (millisecondsControl({ right: 1000, defaultValue: 10 }))({});
  expect(comp.getView()).toEqual(10);
  comp = changeAndExpect(comp, "5", 5);
  comp = changeAndExpect(comp, "5ms", 5);
  comp = changeAndExpect(comp, "5s", 1000);
  comp = changeAndExpect(comp, "-1", 0);
  comp = changeAndExpect(comp, "0.5s", 500);
  comp = changeAndExpect(comp, "2000", 1000);

  comp = new (millisecondsControl({ right: 5, defaultValue: 3, unit: "s" }))({});
  expect(comp.getView()).toEqual(3000);
  comp = changeAndExpect(comp, "5", 5000);
  comp = changeAndExpect(comp, "5ms", 5);
  comp = changeAndExpect(comp, "5s", 5000);
  comp = changeAndExpect(comp, "-1", 0);
  comp = changeAndExpect(comp, "10s", 5000);
  comp = changeAndExpect(comp, "0.5s", 500);
  comp = changeAndExpect(comp, "10000", 5000);
});
