// src/@types/dhtmlx-scheduler.d.ts

declare module 'dhtmlx-scheduler' {
    export class Scheduler {
        static getSchedulerInstance(): Scheduler;

        plugins(plugins: { timeline: boolean }): void;
        init(container: HTMLElement | null, date: Date | string, view: string): void;
        parse(data: any, format: string): void;
        destructor(): void;

        skin: string;
        config: {
            header: string[];
        };

        createTimelineView(config: {
            name: string;
            x_unit: string;
            x_date: string;
            x_step: number;
            x_size: number;
            x_start: number;
            x_length: number;
            y_unit: { key: number; label: string }[];
            y_property: string;
            render: string;
        }): void;
    }
}
