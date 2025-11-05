"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://api.whatsapp.com/send/?phone=5513998059844&text&type=phone_number&app_absent=0"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed
        bottom-4 right-4
        z-50
        bg-green-600
        hover:bg-green-700
        text-white
        w-14 h-14
        rounded-full
        flex items-center justify-center
        shadow-lg
        transition
      "
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
