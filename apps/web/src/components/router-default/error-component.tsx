import { ErrorComponent as DefaultErrorComponent, Link } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

export function ErrorComponent({ error }: { error: Error }) {
  const t = useTranslations();
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
          <Button render={<Link to="/">{t("routeComponents.returnToHomePage")}</Link>} />
        </div>
      </EmptyContent>
    </Empty>
  );
}
