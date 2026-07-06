import { ControlPanelContent } from "./ControlPanelContent";
import { ControlPanelHeader } from "./ControlPanelHeader";
import { ControlPanelTabs } from "./ControlPanelTabs";

export function ControlPanelSection(props) {
  const {
    canManagePlans,
    controlPanelTab,
    liberationRows,
    setControlPanelTab,
  } = props;

  if (!canManagePlans) {
    return null;
  }

  return (
    <section className="content-grid single">
      <article className="panel">
        <ControlPanelHeader liberationRows={liberationRows} />

        <ControlPanelTabs
          controlPanelTab={controlPanelTab}
          setControlPanelTab={setControlPanelTab}
        />

        <ControlPanelContent {...props} />
      </article>
    </section>
  );
}
