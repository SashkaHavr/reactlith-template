import { Link } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty";

export function NotFoundComponent() {
  const t = useTranslations();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("routeComponents.notFound")}</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>{t("routeComponents.notFoundDescription")}</EmptyDescription>
      <EmptyContent>
        <div className="flex gap-2">
          <Button render={<Link to="/" />}>{t("routeComponents.returnToHomePage")}</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
