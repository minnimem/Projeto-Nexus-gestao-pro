import { useEffect, useState } from "react";
import { endpoints } from "../../../services/resources";
import { getCommercialNotificationResultMessage } from "../services/commercialAutomation";

export function useCommercialNotifications({
  canManageNotifications,
  onRefresh,
  setOrderMessage,
  setSavingOrderAction,
}) {
  const [loadingNotificationStatus, setLoadingNotificationStatus] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadNotificationStatus() {
      if (!canManageNotifications) {
        setNotificationStatus(null);
        return;
      }

      setLoadingNotificationStatus(true);
      try {
        const response = await endpoints.notificacoes.status();
        if (active) setNotificationStatus(response);
      } catch {
        if (active) {
          setNotificationStatus({ ativo: false, proximaAcao: "Não foi possível consultar o status das notificações." });
        }
      } finally {
        if (active) setLoadingNotificationStatus(false);
      }
    }

    loadNotificationStatus();
    return () => {
      active = false;
    };
  }, [canManageNotifications]);

  async function handleSendCommercialNotifications() {
    setSavingOrderAction("commercial-notifications");
    setOrderMessage(null);
    try {
      const status = await endpoints.notificacoes.status();
      setNotificationStatus(status);
      if (!status.ativo) {
        setOrderMessage({
          type: "error",
          text: status.proximaAcao || "Notificações externas estão desativadas ou sem webhook configurado.",
        });
        return;
      }

      const result = await endpoints.notificacoes.enviarFollowUps();
      setOrderMessage(getCommercialNotificationResultMessage(result));
      await onRefresh();
    } catch (error) {
      setOrderMessage({ type: "error", text: error.message || "Não foi possível enviar notificações comerciais." });
    } finally {
      setSavingOrderAction("");
    }
  }

  return {
    handleSendCommercialNotifications,
    loadingNotificationStatus,
    notificationStatus,
  };
}
