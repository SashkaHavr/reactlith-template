import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <p className="w-full flex flex-col items-center pt-20">Works!</p>
  );
}
