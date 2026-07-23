import { Card } from "@/components/ui/card";

export function ComingSoon({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <Card className="mt-6 p-6 text-muted-foreground">{message}</Card>
    </div>
  );
}
