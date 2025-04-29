import Link from "next/link";

interface SummaryCardProps {
  id: number;
  title: string;
  createdAt: string;
}

export default function SummaryCard({ id, title, createdAt }: SummaryCardProps) {
  return (
    <Link href={`/summary/${id}`}>
      <div className="border rounded-xl p-4 hover:shadow-md transition">
        <h3 className="font-semibold text-xl">{title}</h3>
        <p className="text-gray-500 text-sm">{new Date(createdAt).toLocaleString()}</p>
      </div>
    </Link>
  );
}
