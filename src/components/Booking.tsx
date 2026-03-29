import React, { useState } from "react";
import { format, addDays, startOfToday, isAfter, isBefore, setHours, setMinutes, isSameDay } from "date-fns";
import { Calendar, Clock, MapPin, Video, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface BookingProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function Booking({ onComplete, onCancel }: BookingProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"online" | "in-person">("online");
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      ...formData,
      type,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-md w-full mx-auto">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-xl font-bold">Book Your Consultation</h2>
        <p className="text-blue-100 text-sm mt-1">15-minute free session with Smile Crafters</p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-gray-600 font-medium">Choose consultation type:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setType("online")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    type === "online" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 hover:border-blue-200"
                  )}
                >
                  <Video size={24} />
                  <span className="font-semibold">Online</span>
                </button>
                <button
                  onClick={() => setType("in-person")}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    type === "in-person" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 hover:border-blue-200"
                  )}
                >
                  <MapPin size={24} />
                  <span className="font-semibold">In-Person</span>
                </button>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4"
              >
                Next
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-600 font-medium">Select Date & Time:</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedDate(d => addDays(d, -1))} disabled={isSameDay(selectedDate, addDays(startOfToday(), 1))} className="p-1 disabled:opacity-30">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold">{format(selectedDate, "MMM d, yyyy")}</span>
                  <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-1">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium border transition-all",
                      selectedTime === time ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:border-blue-300"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleBack} className="flex-1 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50">Back</button>
                <button
                  onClick={handleNext}
                  disabled={!selectedTime}
                  className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={handleBack} className="flex-1 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50">Back</button>
                  <button
                    type="submit"
                    className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
