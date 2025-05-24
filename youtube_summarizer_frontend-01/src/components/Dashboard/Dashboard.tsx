import { User } from "@/context/AuthContext";
import Link from "next/link";


export default function Dashboard({ user} : { user: User | null }) {

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute top-0 left-0 w-full max-w-4xl px-4 py-8">
        <div className="flex flex-col items-start mb-8">
          {user && (
            <h1 className="text-gray-600 text-3xl font-bold mb-2">
              Welcome, {user?.username?.toLocaleUpperCase()}!
            </h1>
          )}
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>
      <div className="w-full max-w-4xl flex flex-col items-center px-4 py-8">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
            Welcome to YouTube Summarizer
          </h1>
          <p className="mt-2 text-lg text-gray-600 text-center">
            Your one-stop solution for summarizing YouTube videos.
          </p>
          <p className="mt-2 text-lg text-gray-600 text-center">
            Please navigate to the{" "}
            <Link className="text-blue-500 hover:underline" href={"/summary"}>
              summary
            </Link>{" "}
            page to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
