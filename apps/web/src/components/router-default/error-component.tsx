import {
  ErrorComponent as DefaultErrorComponent,
  isMatch,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { createTranslator } from "use-intl";

import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

function useOptionalIntl() {
  return useRouterState({ select: (s) => s.matches }).find((m) =>
    isMatch(m, "context.intl.messages"),
  )?.context.intl;
}

export function ErrorComponent({ error }: { error: Error }) {
  const intl = useOptionalIntl();
  const t = intl
    ? createTranslator(intl)
    : (key: string) =>
        ({
          "routeComponents.error": "Something went wrong",
          "routeComponents.returnToHomePage": "	Return to Home page",
        })[key] ?? key;

  console.error(
    JSON.stringify(error, [
      ...Object.getOwnPropertyNames(error).filter((k) => k !== "line" && k !== "column"),
      "name",
    ]),
  );

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          {import.meta.env.DEV && <DefaultErrorComponent error={error} />}
        </EmptyMedia>
        <EmptyTitle>{t("routeComponents.error")}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button nativeButton={false} render={<Link to="/" />}>
            {t("routeComponents.returnToHomePage")}
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
