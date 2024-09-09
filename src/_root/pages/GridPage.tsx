import React, { useRef, useEffect } from 'react';
import { getDate } from 'date-fns';

const GridPage: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const isGrabbing = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const today = new Date();
  const currentTime = today.toLocaleTimeString();
  console.log(currentTime);

  const getCurrentHour = () => {
    const currentHour = new Date().getHours();
    console.log(`Current hour: ${currentHour}`);
  };

  useEffect(() => {
    getCurrentHour();
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-blacktheme font-[700] mb-3">Grid Page</h1>
      <div
        ref={timelineRef}
        className="timeline overflow-x-auto w-full bg-white rounded-[10px] py-2 "
        style={{ whiteSpace: 'nowrap', overflowY: 'scroll' }} // Add overflowY: 'scroll' to enable vertical scrolling
      >
        <div className="flex space-x-20">
          {[...Array(24).keys()].map((index) => {
            const hour = (new Date().getHours() + index) % 24;
            return (
              <div key={index} className="">
                {hour}:00
              </div>
            );
          })}
        </div>
      </div>
      {/* Table */}
      <div ref={tableRef} className="table-container overflow-x-auto w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {/* <th className="border px-4 py-2">Item</th> */}
              {[...Array(24).keys()].map((index) => {
                const hour = (new Date().getHours() + index) % 24;
                return (
                  <th key={index} className="border px-[22px] py-2">
                    {hour}:00
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[...Array(2).keys()].map((row) => (
              <tr key={row}>
                {/* <td className="border px-4 py-2">Row {row + 1}</td> */}
                {[...Array(24).keys()].map((index) => {
                  const hour = (new Date().getHours() + index) % 24;
                  return (
                    <td key={index} className="border px-[22px] py-2">
                      <button className="btn-primary text-[8px] py-[5px] px-[10px]">
                        Add Reservation
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GridPage;
