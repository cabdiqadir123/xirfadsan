import React, { useEffect, useState } from 'react'
import '../Css/dash.css'
import { GrThreeDEffects } from 'react-icons/gr'
import axios from 'axios'
import Header from '../Components/Header';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import moment from 'moment';

function Dashboard() {

    const [rawData, setRawData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const fetch_setbooking_data_to_chart = async () => {
        try {
            const response = await axios.get('https://back-end-for-xirfadsan.onrender.com/api/booking/all');
            const bookings = response.data;

            const preparedData = bookings.map((item) => {
                const amount = parseFloat(item.amount) || 0;
                const date = moment(item.created_at);
                const month = date.format('MMM');
                const year = date.format('YYYY');
                const day = date.format('DD');
                return { amount, day, month, year };
            });

            const maxAmount = Math.max(...preparedData.map((d) => d.amount));

            const chartData = preparedData.map((item) => ({
                ...item,
                percentage: parseFloat(((item.amount / maxAmount) * 100).toFixed(1)),
            }));

            setRawData(chartData);
        } catch (error) {
            console.error('Error loading data', error);
        }
    };

    let filteredData = rawData.filter((d) => {
        return (!selectedMonth || d.month === selectedMonth) && (!selectedYear || d.year === selectedYear);
    });

    if (selectedMonth) {
        filteredData = filteredData.map((d) => ({
            ...d,
            xValue: d.day,
        }));
    } else {
        const monthMap = {};

        filteredData.forEach((item) => {
            const key = `${item.month} ${item.year}`; // Now using readable format
            if (!monthMap[key]) {
                monthMap[key] = {
                    xValue: key,
                    amount: 0,
                    date: moment(`${item.year}-${item.month}-01`, 'YYYY-MMM-DD') // For sorting later
                };
            }
            monthMap[key].amount += item.amount;
        });

        const groupedByMonth = Object.values(monthMap);

        // ✅ Sort by real chronological order
        groupedByMonth.sort((a, b) => a.date - b.date);

        // ✅ Compute max
        const maxAmount = Math.max(...groupedByMonth.map((d) => d.amount));

        // ✅ Final data formatting
        filteredData = groupedByMonth.map((item) => ({
            ...item,
            percentage: parseFloat(((item.amount / maxAmount) * 100).toFixed(1)),
        }));
    }

    const uniqueMonths = [...new Set(rawData.map((d) => d.month))];
    const uniqueYears = [...new Set(rawData.map((d) => d.year))];

    const [booking, setbooking] = useState([]);
    const fetch_setbooking_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/all");
        const resltdata = rptdata.data;
        setbooking(resltdata);
    };

    const [customer, setcustomer] = useState([]);
    const fetch_customer_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/user/customer/all");
        const resltdata = rptdata.data;
        setcustomer(resltdata);
    };

    const [supplier, setsupplier] = useState([]);
    const fetch_supplier_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/supplier/all");
        const resltdata = rptdata.data;
        setsupplier(resltdata);
    };

    const [ongoing_plan, setongoing_plan] = useState([]);
    const fetch_ongoing_plan_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/pending/all");
        const resltdata = rptdata.data;
        setongoing_plan(resltdata);
    };

    const [pending, setpending] = useState([]);
    const fetch_pending_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/pending/all");
        const resltdata = rptdata.data;
        setpending(resltdata);
    };

    const [process, setprocess] = useState([]);
    const fetch_process_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/process/all");
        const resltdata = rptdata.data;
        setprocess(resltdata);
    };

    const [completed, setcompleted] = useState([]);
    const fetch_completed_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/finished/all");
        const resltdata = rptdata.data;
        setcompleted(resltdata);
    };

    const [cancelled, setcancelled] = useState([]);
    const fetch_cancelled_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/booking/cancelled/all");
        const resltdata = rptdata.data;
        setcancelled(resltdata);
    };

    useEffect(() => {
        fetch_setbooking_data();
        fetch_customer_data();
        fetch_supplier_data();
        fetch_ongoing_plan_data();
        fetch_pending_data();
        fetch_process_data();
        fetch_completed_data();
        fetch_cancelled_data();
        fetch_setbooking_data_to_chart();
    }, []);

    return (
        <div className='page'>
            <Header />
            <div className='body'>
                <h1>Dashboard</h1>
                <div className='dash-box1'>
                    <div className='d-box-1'>
                        <div className='d-box-1-top'>
                            <div>
                                <p>booking</p>
                                <h2>{booking.length}</h2>
                            </div>
                            <div style={{
                                background: 'rgba(254, 197, 61,0.3)',
                            }} className='d-box-1-top-icon'>
                                <GrThreeDEffects style={{ color: '#FEC53D' }} />
                            </div>
                        </div>
                        <div className='d-box-1-bottom'>
                            <p>8.5% up from yesterday</p>
                        </div>
                    </div>
                    <div className='d-box-1'>
                        <div className='d-box-1-top'>
                            <div>
                                <p>Customer</p>
                                <h2>{customer.length}</h2>
                            </div>
                            <div style={{
                                background: 'rgba(130, 128, 255,0.3)',
                            }} className='d-box-1-top-icon'>
                                <GrThreeDEffects style={{
                                    color: '#8280FF'
                                }} />
                            </div>
                        </div>
                        <div className='d-box-1-bottom'>
                            <p>8.5% up from yesterday</p>
                        </div>
                    </div>
                    <div className='d-box-1'>
                        <div className='d-box-1-top'>
                            <div>
                                <p>Supllier</p>
                                <h2>{supplier.length}</h2>
                            </div>
                            <div style={{
                                background: 'rgba(74, 217, 145,0.3)',
                            }} className='d-box-1-top-icon'>
                                <GrThreeDEffects style={{
                                    color: '#4AD991'
                                }} />
                            </div>
                        </div>
                        <div className='d-box-1-bottom'>
                            <p>8.5% up from yesterday</p>
                        </div>
                    </div>
                    <div className='d-box-1'>
                        <div className='d-box-1-top'>
                            <div>
                                <p>Ongoing Plan</p>
                                <h2>{ongoing_plan.length}</h2>
                            </div>
                            <div style={{
                                background: 'rgba(255, 144, 102,0.3)',
                            }} className='d-box-1-top-icon'>
                                <GrThreeDEffects style={{
                                    color: '#FF9066'
                                }} />
                            </div>
                        </div>
                        <div className='d-box-1-bottom'>
                            <p>8.5% up from yesterday</p>
                        </div>
                    </div>
                </div>
                <div className='dash-box2'>
                    <div className='d-box-2'>
                        <h4>{pending.length}</h4>
                        <h4>Pending</h4>
                    </div>
                    <div className='d-box-2'>
                        <h4>{process.length}</h4>
                        <h4>Progress</h4>
                    </div>
                    <div className='d-box-2'>
                        <h4>{completed.length}</h4>
                        <h4>Cancelled</h4>
                    </div>
                    <div className='d-box-2'>
                        <h4>{cancelled.length}</h4>
                        <h4>Success</h4>
                    </div>
                </div>


                <div className='dash-box3'>

                    <div style={{ width: '100%', padding: 20 }}>
                        <div className='dash-box3-header'>
                            <h2>Bookings by Day — Amount vs. Percentage</h2>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: 20 }}>
                                <label>
                                    Select Month:{' '}
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        <option value="">All Months</option>
                                        {uniqueMonths.map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Select Year:{' '}
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        <option value="">All Years</option>
                                        {uniqueYears.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        {booking && booking.length > 0 ? (
                            <ResponsiveContainer width="100%" height={270}>
                                <AreaChart
                                    data={filteredData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="xValue" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const { payload } = props;
                                            if (name === 'amount') return [`$${payload.amount}`, 'Amount'];
                                            if (name === 'percentage') return [`${payload.percentage}%`, 'Percentage'];
                                            return [value, name];
                                        }}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload[0]) {
                                                return `Percentage: ${payload[0].payload.percentage}%`;
                                            }
                                            return '';
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.3}
                                        dot={{ r: 5, stroke: '#8884d8', strokeWidth: 2, fill: 'white' }}
                                        activeDot={{ r: 7 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                No booking data.
                            </div>
                        )}
                    </div>


                </div>


            </div>
        </div>
    )
}

export default Dashboard