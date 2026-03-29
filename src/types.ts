export interface Message {
  id: string;
  role: "user" | "model";
  content: string; // This will be the JSON string from Gemini
  timestamp: number;
}

export interface GeminiResponse {
  text: string;
  imageUrl?: string;
  showBooking?: boolean;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  type: "online" | "in-person";
  date: string;
  time: string;
}
