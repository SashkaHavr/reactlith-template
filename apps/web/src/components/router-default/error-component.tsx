import { ErrorComponent as DefaultErrorComponent } from "@tanstack/react-router";

import { m } from "@reactlith-template/intl/messages";
import { logError } from "~/lib/log";

import { LinkButton } from "../ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

export function ErrorComponent({ error }: { error: Error }) {
  logError(error);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          {import.meta.env.DEV && <DefaultErrorComponent error={error} />}
        </EmptyMedia>
        <EmptyTitle>{m.routeDefault_error()}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <LinkButton to="/">{m.routeDefault_returnToHomePage()}</LinkButton>
        </div>
      </EmptyContent>
    </Empty>
  );
}
