import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
var debounce = require("lodash.debounce");
import Color from "../helpers/color";
import waitForElement from "../helpers/waitForElement";
import AdjustmentArea from "@/components/AdjustmentArea";
import { Swatch } from "@/types/Swatch";
import { Node } from "@/types/Node";
import { NodeMatrix } from "@/types/NodeMatrix";
import { EnumNodeItem } from "@/types/EnumNodeItem";

const inter = Inter({ subsets: ["latin"] });

const oldLogger = console.log;

export default function Home() {
  const [swatches, setSwatches] = useState<Swatch[]>([
    { colorHex: `#833AB4`, colorHsv: { h: 276, s: 68, v: 71 }, clicked: false },
    { colorHex: `#C13584`, colorHsv: { h: 276, s: 68, v: 71 }, clicked: false },
    { colorHex: `#E1306C`, colorHsv: { h: 276, s: 68, v: 71 }, clicked: false },
    { colorHex: `#F77737`, colorHsv: { h: 276, s: 68, v: 71 }, clicked: false },
    { colorHex: `#FFDC80`, colorHsv: { h: 276, s: 68, v: 71 }, clicked: false }
  ]);
  const [focusedSwatch, setFocusedSwatch] = useState<Swatch>({
    colorHex: `#833AB4`,
    colorHsv: { h: 276, s: 68, v: 71 },
    clicked: true
  });

  const [nodeMatrix, setNodeMatrix] = useState<NodeMatrix>([
    [
      { type: "H", value: 276, dataset: {}, translateY: 0 },
      { type: "S", value: 68, dataset: {}, translateY: 0 },
      { type: "V", value: 71, dataset: {}, translateY: 0 }
    ],
    [
      { type: "H", value: 326, dataset: {}, translateY: 0 },
      { type: "S", value: 73, dataset: {}, translateY: 0 },
      { type: "V", value: 76, dataset: {}, translateY: 0 }
    ],
    [
      { type: "H", value: 340, dataset: {}, translateY: 0 },
      { type: "S", value: 79, dataset: {}, translateY: 0 },
      { type: "V", value: 88, dataset: {}, translateY: 0 }
    ],
    [
      { type: "H", value: 20, dataset: {}, translateY: 0 },
      { type: "S", value: 78, dataset: {}, translateY: 0 },
      { type: "V", value: 97, dataset: {}, translateY: 0 }
    ],
    [
      { type: "H", value: 43, dataset: {}, translateY: 0 },
      { type: "S", value: 50, dataset: {}, translateY: 0 },
      { type: "V", value: 100, dataset: {}, translateY: 0 }
    ]
  ]);

  useEffect(() => {
    (async () => {
      let container = await waitForElement("#node-container");
      setNodeMatrix((prevState: NodeMatrix) => {
        let track = container.querySelector(".node-track");
        let trackHeight = track.clientHeight;
        let nextState = prevState.map((swatch) => {
          return swatch.map((value, i) => {
            switch (i) {
              case 0:
                value.translateY = (value.value / 360) * trackHeight;
                break;
              case 1:
                value.translateY =
                  trackHeight - (value.value / 100) * trackHeight;
                break;
              case 2:
                value.translateY =
                  trackHeight - (value.value / 100) * trackHeight;
                break;
            }
            return value;
          });
        });
        return nextState;
      });
    })();

    return () => {
      return void 0;
    };
  }, [typeof window]);

  function dragElement(
    e: any,
    start: any,
    offset: any,
    target: any,
    trackHeight: number,
    node: Node,
    i: number,
    j: number
  ) {
    let drag = {
      x: 0,
      y: e.clientY * (20 / 21) - start.y * (20 / 21) + offset.y
    };

    let logger: any = document.getElementById("cursor-position");
    logger.textContent = JSON.stringify(
      {
        start: start.y,
        offset: offset.y,
        drag: drag.y
      },
      null,
      2
    );

    let tracker: any = document.getElementById("track-height");
    tracker.textContent = trackHeight + "px";

    let translateY = e.clientY * (20 / 21) - start.y * (20 / 21) + offset.y;

    setSwatches((prevState: Swatch[]) => {
      let hsv = Color().fromHex(prevState[i].colorHex).toHsv();
      let percentage = translateY / trackHeight;
      if (percentage <= 0) {
        switch (j) {
          case 0:
            hsv.h = 0;
            break;
          case 1:
            hsv.s = 100;
            break;
          case 2:
            hsv.v = 100;
            break;
        }
      } else if (percentage >= 1) {
        switch (j) {
          case 0:
            hsv.h = 360;
            break;
          case 1:
            hsv.s = 0;
            break;
          case 2:
            hsv.v = 0;
            break;
        }
      } else {
        switch (j) {
          case 0:
            hsv.h = ((translateY * (21 / 20)) / trackHeight) * 360;
            break;
          case 1:
            hsv.s = 100 - ((translateY * (21 / 20)) / trackHeight) * 100;
            break;
          case 2:
            hsv.v = 100 - ((translateY * (21 / 20)) / trackHeight) * 100;
            break;
        }
      }
      let hexadecimal = Color().fromHsv(hsv).toString();
      prevState[i].colorHex = hexadecimal;
      return prevState;
    });

    setNodeMatrix((prevState: NodeMatrix) => {
      let nextState = prevState.map((swatch) =>
        swatch.map((node) => Object.assign({}, node))
      );

      let percentage = translateY / trackHeight;
      if (percentage <= 0) {
        nextState[i][j].translateY = 0;
        nextState[i][j].value = 0;
      } else if (percentage >= 1) {
        nextState[i][j].translateY = trackHeight;
        if (j === 0) {
          nextState[i][j].value = 360;
        } else {
          nextState[i][j].value = 100;
        }
      } else {
        nextState[i][j].translateY = translateY;
        if (j === 0) {
          nextState[i][j].value =
            ((translateY * (21 / 20)) / trackHeight) * 360;
        } else {
          nextState[i][j].value =
            ((translateY * (21 / 20)) / trackHeight) * 100;
        }
      }
      return nextState;
    });
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    return void 0;
  }
  function deselectAll() {
    setSwatches((prevState: Swatch[]) => {
      return prevState.map((swatch) => {
        swatch.clicked = false;
        return Object.assign({}, swatch);
      });
    });
  }

  return (
    <>
      <div className="w-full h-full relative" onClick={deselectAll}>
        <div id="header" className="h-20 bg-white dark:bg-black w-full z-10">
          HEADER
        </div>
        <div id="main-container" className="flex h-screen w-screen relative">
          <aside
            id="sidebar"
            className="bg-gradient-to-tr dark:from-stone-900 dark:to-stone-900 from-white to-stone-50 w-[297px] min-w-[297px] overflow-y-auto"
          >
            SIDEBAR
            <pre>Swatches: {JSON.stringify(swatches, null, 2)}</pre>
          </aside>
          <div id="main" className="w-full relative flex dark:bg-stone-800">
            <div id="canvas" className="w-full py-12 relative">
              <div
                id="node-container"
                className="w-[90%] mx-auto rounded-2xl flex h-full max-h-full shadow-2xl shadow-black relative"
              >
                {swatches.map((swatch: Swatch, i: number) => {
                  return (
                    <div
                      key={v4()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        swatches.forEach((swatch) => {
                          swatch.clicked = false;
                        });
                        swatches[i].clicked = true;
                        setSwatches(swatches);
                        setFocusedSwatch(swatch);
                      }}
                      className={`swatch border-4 border-[transparent] text-center flex items-center justify-center cursor-pointer h-full w-full transition-all duration-300 hover:shadow-2xl hover:z-10 hover:scale-105 hover:rounded
                      ${
                        swatch.clicked
                          ? "shadow-2xl z-20 scale-105 rounded !border-[#ffffff88]"
                          : i === 0
                          ? "rounded-l-[10px]"
                          : i === swatches.length - 1
                          ? "rounded-r-[10px]"
                          : ""
                      }
                      `}
                      style={{ background: swatch.colorHex || void 0 }}
                    >
                      <div className="node-track h-full relative w-6">
                        {nodeMatrix[i].map((node, j) => (
                          <div
                            key={v4()}
                            className="node rounded-full w-6 h-6 flex items-center justify-center text-xs bg-white border-[3px] font-bold border-black text-black unselectable absolute top-0 -mt-[0.75rem] cursor-grab active:cursor-grabbing"
                            onMouseDown={(e: any) => {
                              e.preventDefault();
                              e.stopPropagation();

                              swatches.forEach((swatch) => {
                                swatch.clicked = false;
                              });
                              swatches[i].clicked = true;
                              setSwatches(swatches);

                              const target = e.target;

                              let start = {
                                x: 0,
                                y: e.clientY
                              };

                              let style = getComputedStyle(target);
                              let matrix = new WebKitCSSMatrix(style.transform);
                              let trackHeight =
                                target.parentElement.clientHeight;

                              console.log("MATRIX", matrix);

                              let offset = {
                                x: 0,
                                y: matrix.m42
                              };

                              document.onmousemove = (e2: any) => {
                                e2.preventDefault();
                                e2.stopPropagation();
                                dragElement(
                                  e2,
                                  start,
                                  offset,
                                  target,
                                  trackHeight,
                                  node,
                                  i,
                                  j
                                );
                              };
                              document.onmouseup = (e3) => {
                                closeDragElement();
                              };
                            }}
                            style={{
                              transform: `translate(0px, ${node.translateY}px)`
                            }}
                          >
                            {node.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside
              id="adjustment-area"
              className="border-l-4 dark:border-stone-900 bg-white border-stone-100 py-12 px-6 dark:bg-stone-900 overflow-y-auto w-[33%]"
              //  text-center
            >
              Functionality <br />
              <input type="checkbox" />
              <label className="pl-3">Lock Hue</label>
              <br />
              <small>Locks the relative position of all H nodes.</small>
              <br />
              <input type="checkbox" />
              <label className="pl-3">Monochrome</label>
              <br />
              <small>Sets hue of all swatches to the first swatch.</small>
              <hr className="my-5" />
              <pre>Current Swatch</pre>
              <pre>{JSON.stringify(focusedSwatch, null, 2)}</pre>
              <hr className="my-5" />
              Visualization
              <br />
              <input type="checkbox" />
              <label className="pl-3">Linear</label>
              <br />
              <small>Creates a line between nodes.</small>
              <br />
              <input type="checkbox" />
              <label className="pl-3">Interpolated</label>
              <br />
              <small>Generates a curve between nodes.</small>
              <hr className="my-5" />
              <pre>
                Track Height: <span id="track-height"></span>
              </pre>
              <pre>
                Position: <span id="cursor-position"></span>
              </pre>
              <pre>NodeMatrix: {JSON.stringify(nodeMatrix, null, 2)}</pre>
              <pre id="logger"></pre>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
