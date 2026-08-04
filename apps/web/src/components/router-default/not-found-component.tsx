import { m } from "@reactlith-template/intl/messages";

import { LinkButton } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";

export function NotFoundComponent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{m.routeDefault_notFound()}</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>{m.routeDefault_notFoundDescription()}</EmptyDescription>
      <EmptyContent>
        <div className="flex gap-2">
          <LinkButton to="/">{m.routeDefault_returnToHomePage()}</LinkButton>
        </div>
      </EmptyContent>
    </Empty>
  );
}
