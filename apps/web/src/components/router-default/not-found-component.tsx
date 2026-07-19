import { m } from "@reactlith-template/intl/messages";

import { LinkButton } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";

export function NotFoundComponent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{m.not_found()}</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>{m.not_found_description()}</EmptyDescription>
      <EmptyContent>
        <div className="flex gap-2">
          <LinkButton to="/">{m.return_to_home_page()}</LinkButton>
        </div>
      </EmptyContent>
    </Empty>
  );
}
