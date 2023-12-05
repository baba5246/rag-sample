import { QueryForm } from "@/components/QueryForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="py-1 text-xl">RAG sample</div>
      <QueryForm />
    </main>
  );
}