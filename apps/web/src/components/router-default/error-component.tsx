import { ErrorComponent as DefaultErrorComponent } from "@tanstack/react-router";

import { m } from "@reactlith-template/intl/messages";
import { logError } from "~/lib/log";

import { LinkButton } from "../ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

// function useOptionalIntl() {
//   return useRouterState({ select: (s) => s.matches }).find((m) =>
//     isMatch(m, "context.intl.messages"),
//   )?.context.intl;
// }

export function ErrorComponent({ error }: { error: Error }) {
  // const intl = useOptionalIntl();
  // const t = intl
  //   ? createTranslator(intl)
  //   : (key: string) =>
  //       ({
  //         "routeComponents.error": "Something went wrong",
  //         "routeComponents.returnToHomePage": "Return to Home page",
  //       })[key] ?? key;

  logError(error);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          {import.meta.env.DEV && <DefaultErrorComponent error={error} />}
        </EmptyMedia>
        <EmptyTitle>{m.error()}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <LinkButton to="/">{m.return_to_home_page()}</LinkButton>
        </div>
      </EmptyContent>
    </Empty>
  );
}
