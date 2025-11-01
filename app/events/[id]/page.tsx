// app/events/[id]/page.tsx
import React from "react";

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Event ID: {params.id}</h1>
    </div>
  );
}
