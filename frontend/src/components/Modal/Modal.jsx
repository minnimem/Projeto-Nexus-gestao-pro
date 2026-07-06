import { X } from "lucide-react";
import "./Modal.css";

export function Modal({ children, onClose, open, title }) {
  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" role="presentation">
      <section aria-modal="true" className="ui-modal" role="dialog">
        <header>
          <h2>{title}</h2>
          <button aria-label="Fechar" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <div className="ui-modal-content">{children}</div>
      </section>
    </div>
  );
}
