# Example: Implementing a React Page - RemoteFix

```tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";

const fetchTickets = async () => {
  const res = await fetch("/api/tickets");
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const TicketsListPage: React.FC = () => {
  const { data: tickets, isLoading } = useQuery({ queryKey: ["tickets"], queryFn: fetchTickets });

  if (isLoading) return <div className="text-cyan-400">Loading Support Queue...</div>;

  return (
    <div className="min-h-screen bg-[#030712] p-6 text-white">
      <h2 className="text-xl font-bold border-b border-white/10 pb-2">Tickets Queue</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {tickets?.map((t: any) => (
          <li key={t.id} className="p-4 rounded-lg border border-white/10 bg-slate-900/50">
            {t.subject}
          </li>
        ))}
      </ul>
    </div>
  );
};
```
