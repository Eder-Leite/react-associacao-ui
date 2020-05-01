import Loading from '../loading';
import { Panel } from 'primereact/panel';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendar } from 'primereact/fullcalendar';
import interactionPlugin from '@fullcalendar/interaction';

class Calendario extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fullcalendarOptions: {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                defaultDate: '2019-08-23',
                locale: 'pt-br',
                header: {
                    left: 'prev,next',
                    center: 'title',
                    right: 'month'
                },
                editable: true,
                dateClick(info) {
                    console.log(info.resource);
                    alert('clicked ' + info.dateStr + '!');
                }
            },

            events: [
                {
                    id: 0,
                    title: 'All Day Event very long title',
                    start: new Date(2019, 3, 0),
                    end: new Date(2019, 3, 1),
                },
                {
                    id: 1,
                    title: 'Long Event',
                    start: new Date(2019, 3, 7),
                    end: new Date(2019, 3, 10),
                },

                {
                    id: 2,
                    title: 'DTS STARTS',
                    start: new Date(2016, 2, 13, 0, 0, 0),
                    end: new Date(2016, 2, 20, 0, 0, 0),
                },

                {
                    id: 3,
                    title: 'DTS ENDS',
                    start: new Date(2016, 10, 6, 0, 0, 0),
                    end: new Date(2016, 10, 13, 0, 0, 0),
                },

                {
                    id: 4,
                    title: 'Some Event',
                    start: new Date(2019, 3, 9, 0, 0, 0),
                    end: new Date(2019, 3, 10, 0, 0, 0),
                },
                {
                    id: 5,
                    title: 'Conference',
                    start: new Date(2019, 3, 11),
                    end: new Date(2019, 3, 13),
                },
                {
                    id: 6,
                    title: 'Meeting',
                    start: new Date(2019, 3, 12, 10, 30, 0, 0),
                    end: new Date(2019, 3, 12, 12, 30, 0, 0),
                },
                {
                    id: 7,
                    title: 'Lunch',
                    start: new Date(2019, 3, 12, 12, 0, 0, 0),
                    end: new Date(2019, 3, 12, 13, 0, 0, 0),
                },
                {
                    id: 8,
                    title: 'Meeting',
                    start: new Date(2019, 3, 12, 14, 0, 0, 0),
                    end: new Date(2019, 3, 12, 15, 0, 0, 0),
                },
                {
                    id: 9,
                    title: 'Happy Hour',
                    start: new Date(2019, 3, 12, 17, 0, 0, 0),
                    end: new Date(2019, 3, 12, 17, 30, 0, 0),
                },
                {
                    id: 10,
                    title: 'Dinner',
                    start: new Date(2019, 3, 12, 20, 0, 0, 0),
                    end: new Date(2019, 3, 12, 21, 0, 0, 0),
                },
                {
                    id: 11,
                    title: 'Birthday Party',
                    start: new Date(2019, 3, 13, 7, 0, 0),
                    end: new Date(2019, 3, 13, 10, 30, 0),
                },
                {
                    id: 12,
                    title: 'Late Night Event',
                    start: new Date(2019, 3, 17, 19, 30, 0),
                    end: new Date(2019, 3, 18, 2, 0, 0),
                },
                {
                    id: 12.5,
                    title: 'Late Same Night Event',
                    start: new Date(2019, 3, 17, 19, 30, 0),
                    end: new Date(2019, 3, 17, 23, 30, 0),
                },
                {
                    id: 13,
                    title: 'Multi-day Event',
                    start: new Date(2019, 3, 20, 19, 30, 0),
                    end: new Date(2019, 3, 22, 2, 0, 0),
                },
                {
                    id: 14,
                    title: 'Today',
                    start: new Date(new Date().setHours(new Date().getHours() - 3)),
                    end: new Date(new Date().setHours(new Date().getHours() + 3)),
                },
                {
                    id: 15,
                    title: 'Point in Time Event',
                    start: new Date(),
                    end: new Date(),
                },
                {
                    id: 16,
                    title: 'Point in Time Event 2',
                    start: new Date(),
                    end: new Date(),
                },
                {
                    id: 17,
                    title: 'Point in Time Event 3',
                    start: new Date(),
                    end: new Date(),
                },
            ]

        }
        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Calendário';
    }

    locale() {
        var calendar = document.getElementById('calendar');
        console.log(calendar);
    }

    componentDidMount() {
        setTimeout(() => {
            this.locale();
            Loading.onHide();
        }, 300);
    }

    render() {

        return (
            <div style={{ padding: 10 }} className='p-grid p-fluid dashboard'>
                <div className='p-col-12 p-lg-12'>
                    <Panel header='Calendário' style={{ height: '100%' }}>
                        <FullCalendar
                            events={this.state.events}
                            options={this.state.fullcalendarOptions}
                        >
                        </FullCalendar>
                    </Panel>
                </div>
            </div >
        );
    }
}

export default withRouter(Calendario);