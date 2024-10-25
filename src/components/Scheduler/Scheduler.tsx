"use client"

import React, { useEffect, useRef } from 'react'
import { Scheduler as DHXScheduler } from "dhtmlx-scheduler"
import "dhtmlx-scheduler/codebase/dhtmlxscheduler.css"

// Importing the timeline view
import "dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_timeline"

interface Event {
  start_date: string;
  end_date: string;
  text: string;
  id: number;
}

interface SchedulerProps {
  events: Event[];
}

export default function Scheduler({ events }: SchedulerProps) {
  const schedulerContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!schedulerContainer.current) return

    const scheduler = DHXScheduler.getSchedulerInstance()

    scheduler.config.date_format = "%Y-%m-%d %H:%i"
    scheduler.config.first_hour = 4
    scheduler.config.last_hour = 23
    scheduler.config.time_step = 30
    scheduler.config.details_on_create = true
    scheduler.config.details_on_dblclick = true

    scheduler.locale.labels.timeline_tab = "Timeline"
    scheduler.locale.labels.section_custom = "Table"

    scheduler.createTimelineView({
      name: "timeline",
      x_unit: "minute",
      x_date: "%H:%i",
      x_step: 30,
      x_size: 24,
      x_start: 8,
      x_length: 48,
      y_unit: [
        {key: 1, label: "Table 01"},
        {key: 2, label: "Table 02"},
        {key: 3, label: "Table 03"},
        {key: 4, label: "Table 04"},
        {key: 5, label: "Table 05"},
        {key: 6, label: "Table 06"},
        {key: 7, label: "Table 07"},
      ],
      y_property: "table_id",
      render: "bar",
      section_autoheight: false,
      event_dy: "full"
    })

    scheduler.init(schedulerContainer.current, new Date(), "timeline")

    // Parse the events passed as props
    scheduler.parse(events)

    // Add meal time indicators
    const meals = [
      { start_date: "2023-05-20 04:00", end_date: "2023-05-20 06:00", text: "Breakfast", type: "meal" },
      { start_date: "2023-05-20 06:00", end_date: "2023-05-20 09:00", text: "Lunch", type: "meal" },
      { start_date: "2023-05-20 09:00", end_date: "2023-05-20 11:00", text: "Dinner", type: "meal" }
    ]
    scheduler.parse(meals)

    // Custom rendering for meal time indicators
    scheduler.templates.event_class = function(start, end, event) {
      return event.type === "meal" ? "meal-time" : ""
    }

    scheduler.templates.event_bar_text = function(start, end, event) {
      return event.type === "meal" ? event.text : `<b>${event.text}</b>`
    }

    // Clean up on component unmount
    return () => {
      scheduler.destructor()
    }
  }, [events])

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>
      <div ref={schedulerContainer} className='dhx_cal_container' style={{width: '100%', height: 'calc(100% - 50px)'}}>
        <div className="dhx_cal_navline">
          <div className="dhx_cal_prev_button">&nbsp;</div>
          <div className="dhx_cal_next_button">&nbsp;</div>
          <div className="dhx_cal_today_button"></div>
          <div className="dhx_cal_date"></div>
        </div>
        <div className="dhx_cal_header"></div>
        <div className="dhx_cal_data"></div>
      </div>
      <style jsx global>{`
        .dhx_cal_event.meal-time {
          background-color: #e0f2f1;
          color: #00695c;
          border: none;
          text-align: center;
        }
        .dhx_cal_event.meal-time .dhx_body {
          opacity: 0.8;
        }
        .dhx_cal_event.meal-time .dhx_title {
          display: none;
        }
      `}</style>
    </div>
  )
}