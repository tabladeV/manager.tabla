import { useEffect, useRef, useState } from "react";
import "dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
import { Scheduler } from "dhtmlx-scheduler";
import { useDateContext } from '../../context/DateContext'; // Import the custom hook
import '../../styling/schedulerStyles.css';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

        scheduler.skin = "material";
        scheduler.config.header = ["date"];

        // Create timeline view configuration
        scheduler.createTimelineView({
            name: "timeline",
            x_unit: "minute",
            x_date: "%H:%i",
            x_step: 30,
            x_size: 48,
            x_start: 0,
            dx: 70,
            x_length: 6,
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
            scrollable: true,  
            autoscroll: {           
                range_x: 200,       
                range_y: 100,       
                speed_x: 20,        
                speed_y: 10         
            },
            column_width: 120, 
        });

        // Initialize the scheduler using chosenDay from the context
        scheduler.init(container.current, chosenDay, "timeline");


        const events = [
            { id: 1, start_date: "2025-01-26 09:00", end_date: "2025-01-26 12:00", text: "Grec", room: 1 },
            { id: 2, start_date: "2025-01-27 10:30", end_date: "2025-01-27 11:30", text: "Alex", room: 2 },
            { id: 3, start_date: "2025-01-28 12:00", end_date: "2025-01-28 13:00", text: "Madisson", room: 3 },
            { id: 4, start_date: "2025-01-29 13:00", end_date: "2025-01-29 15:00", text: "Brandon", room: 1 },
            { id: 5, start_date: "2025-01-26 15:00", end_date: "2025-01-26 17:00", text: "Alfred", room: 2 },
            { id: 6, start_date: "2025-01-27 17:00", end_date: "2025-01-27 19:00", text: "Grec", room: 3 },
            { id: 7, start_date: "2025-01-28 19:00", end_date: "2025-01-28 21:00", text: "Alex", room: 6 },
            { id: 8, start_date: "2025-01-29 21:00", end_date: "2025-01-29 23:00", text: "Madisson", room: 10 },
            { id: 9, start_date: "2025-01-26 23:00", end_date: "2025-01-26 23:59", text: "Brandon", room: 8 },
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

    const {t} = useTranslation();


    

    return (
        <div className="w-full h-full ">
            
            <div>
                <div className="mb-2 flex  items-center justify-between">
                    <h1>{t('agenda.title')}</h1>
                    <Link to='/agenda/grid' className={`btn sm:hidden ${localStorage.getItem('darkMode')==='true'? 'text-white':''} `}>Grid View {'>'}</Link>
                </div>
              
            </div>
            <div ref={container} id="scheduler_here" className="dhx_cal_container ltr" style={{ width: '100%', height: '500px' }}>
                <div className="dhx_cal_navline">
                    
                    <div className="dhx_cal_tab" data-name="timeline_tab"></div>
                </div>
            </div>
        </div>
    );
}
