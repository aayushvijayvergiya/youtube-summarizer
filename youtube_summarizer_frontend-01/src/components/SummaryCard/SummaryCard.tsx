import Link from "next/link";

interface SummaryCardProps {
  id: string;
  title: string;
  createdAt: string;
  url: string;
}

export default function SummaryCard({ id, title, createdAt, url }: SummaryCardProps) {
  return (
    <Link href={`/summary/${id}`}>
      <div className="border rounded-xl p-4 hover:shadow-md transition">
        <h3 className="font-semibold text-xl">{title}</h3>
        <p className="text-gray-500 text-sm">{new Date(createdAt).toDateString()}</p>
        <p className="text-gray-700 mt-2">{url}</p>
      </div>
    </Link>
  );
}
