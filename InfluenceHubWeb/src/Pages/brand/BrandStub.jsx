import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
  AdminPage,
  AdminPanel,
  AdminPanelHeader,
  EmptyState,
} from "../../Components/AdminShared";
import { TransitionLink } from "../../Components/Motion/TransitionLink";

const BrandStub = ({ description, kicker, title }) => (
  <AdminPage>
    <AdminPanel>
      <AdminPanelHeader kicker={kicker} title={title} description={description} />
      <EmptyState
        title="This workspace is on the roadmap"
        description="We are wiring campaign creation, applications, and reporting next. Your dashboard stays live with live campaign data today."
        action={(
          <TransitionLink
            to="/dashboard/brand"
            className="ih-button-primary ih-focus-ring inline-flex items-center gap-2 px-4 py-3 text-sm"
          >
            Back to brand home
            <ArrowUpRight size={16} aria-hidden="true" />
          </TransitionLink>
        )}
      />
    </AdminPanel>
  </AdminPage>
);

export default BrandStub;
