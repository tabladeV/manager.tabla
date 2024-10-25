import { useEffect, useRef } from "react";
import "dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
import { Scheduler } from "dhtmlx-scheduler";
import { useDateContext } from '../../context/DateContext'; // Import the custom hook
import '../../styling/schedulerStyles.css';
import { Link } from "react-router-dom";

export default function SchedulerView() {
    const container = useRef<HTMLDivElement>(null);

    // Access chosenDay from the DateContext
    const { chosenDay } = useDateContext();

    useEffect(() => {
        // Ensure the container ref is defined
        if (!container.current) return;

        const scheduler = Scheduler.getSchedulerInstance();

        // Register plugins and set up configuration
        scheduler.plugins({
            timeline: true,
        });

        scheduler.skin = "flat";
        scheduler.config.header = ["date"];

        // Create timeline view configuration
        scheduler.createTimelineView({
            name: "timeline",
            x_unit: "hour",
            x_date: "%H:%i",
            x_step: 1,
            x_size: 24,
            x_start: 0,
            x_length: 24,
            y_unit: [
                { key: 1, label: "Table 1" },
                { key: 2, label: "Table 2" },
                { key: 3, label: "Table 3" },
                { key: 4, label: "Table 4" },
                { key: 5, label: "Table 5" },
                { key: 6, label: "Table 6" },
                { key: 7, label: "Table 7" },
                { key: 8, label: "Table 8" },
                { key: 9, label: "Table 9" },
                { key: 10, label: "Table 10" },
            ],
            y_property: "room",
            render: "bar",
        });

        // Initialize the scheduler using chosenDay from the context
        scheduler.init(container.current, chosenDay, "timeline");

        const events = [
            { id: 1, start_date: "2024-10-25 09:00", end_date: "2024-10-25 12:00", text: "Grec", room: 1 },
            { id: 2, start_date: "2024-10-25 10:30", end_date: "2024-10-25 11:30", text: "Alex", room: 2 },
            { id: 3, start_date: "2024-10-25 12:00", end_date: "2024-10-25 13:00", text: "Madisson", room: 3 },
            { id: 4, start_date: "2024-10-25 13:00", end_date: "2024-10-25 15:00", text: "Brandon", room: 1 },
            { id: 5, start_date: "2024-10-25 15:00", end_date: "2024-10-25 17:00", text: "Alfred", room: 2 },
            { id: 6, start_date: "2024-10-25 17:00", end_date: "2024-10-25 19:00", text: "Grec", room: 3 },
            { id: 7, start_date: "2024-10-25 19:00", end_date: "2024-10-25 21:00", text: "Alex", room: 6 },
            { id: 8, start_date: "2024-10-25 21:00", end_date: "2024-10-25 23:00", text: "Madisson", room: 10 },
            { id: 9, start_date: "2024-10-25 23:00", end_date: "2024-10-25 23:59", text: "Brandon", room: 8 },
        ];
        scheduler.parse(events, "json");

        // Clean up the scheduler on component unmount
        return () => {
            scheduler.destructor();
            if (container.current) {
                container.current.innerHTML = "";
            }
        };
    }, [chosenDay]); // Re-run useEffect if chosenDay changes

    return (
        <div className="w-full h-full ">
            <div className="mb-2 flex justify-between">
                <h1>Agenda Page</h1>
                <Link to='/agenda/grid' className='btn sm:hidden block'>Grid View {'>'}</Link>
            </div>
            <div ref={container} id="scheduler_here" className="dhx_cal_container" style={{ width: '99%', height: '500px' }}>
                <div className="dhx_cal_navline">
                    <div className="dhx_cal_tab" data-name="timeline_tab"></div>
                </div>
            </div>
        </div>
    );
}
