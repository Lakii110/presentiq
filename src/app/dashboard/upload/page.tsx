"use client";
import { Suspense } from "react";
import NewPractice from "@/views/NewPractice";

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <NewPractice />
    </Suspense>
  );
}
