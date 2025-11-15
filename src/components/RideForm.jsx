import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

export default function RideForm(props) {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    return (
        <>
            <div className="w-full h-auto flex justify-start mt-6">
                <form className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-5 border border-gray-200">

                    <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                        Book Your Ride
                    </h2>

                    {/* From */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">From:</label>
                        <input
                            type="text"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={props.pickupRef.current?.value}
                            readOnly
                            disabled
                        />
                    </div>

                    {/* To */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">To:</label>
                        <input
                            type="text"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={props.dropoffRef.current?.value}
                            readOnly
                            disabled
                        />
                    </div>

                    {/* Driver */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Driver:</label>
                        <input
                            type="text"
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={props.driverInfo?.name}
                            readOnly
                            disabled
                        />
                    </div>

                    {/* Date & Time in same row */}
                    <div className="flex w-full space-x-4">

                        {/* Date Picker */}
                        <div className="flex flex-col w-1/2">
                            <label className="text-gray-700 text-sm mb-1 px-1">Date</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 z-10" />
                                <DatePicker
                                    selected={date}
                                    onChange={(d) => setDate(d)}
                                    placeholderText="Select"
                                    className="w-full bg-gray-100 text-black py-2 pl-10 pr-4 rounded-xl appearance-none focus:outline-none"
                                    dateFormat="MMM d, yyyy"
                                    minDate={new Date()}
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        </div>

                        {/* Time Picker */}
                        <div className="flex flex-col w-1/2">
                            <label className="text-gray-700 text-sm mb-1 px-1">Time</label>
                            <div className="relative">
                                <FaClock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 z-10" />
                                <DatePicker
                                    selected={time}
                                    onChange={(t) => setTime(t)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="h:mm aa"
                                    placeholderText="Select"
                                    className="w-full bg-gray-100 text-black py-2 pl-10 pr-4 rounded-xl appearance-none focus:outline-none"
                                    popperPlacement="bottom-start"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-300"
                    >
                        Submit
                    </button>

                </form>
            </div>
        </>
    );
}
