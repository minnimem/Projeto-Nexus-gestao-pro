import { PackageCheck, Truck } from "lucide-react";

export function PointOfSaleDeliveryFields({
  deliveryAddress,
  deliveryNote,
  deliveryType,
  setDeliveryAddress,
  setDeliveryNote,
  setDeliveryType,
}) {
  return (
    <>
      <div className="form-control delivery-control">
        <span>Entrega</span>
        <div className="delivery-options">
          <button className={deliveryType === "RETIRADA_LOJA" ? "active" : ""} onClick={() => setDeliveryType("RETIRADA_LOJA")} type="button">
            <PackageCheck size={16} /> Retirar na loja
          </button>
          <button className={deliveryType === "ENTREGA" ? "active" : ""} onClick={() => setDeliveryType("ENTREGA")} type="button">
            <Truck size={16} /> Entregar
          </button>
        </div>
      </div>

      {deliveryType === "ENTREGA" && (
        <label className="form-control client-picker-control">
          <span>Endereco de entrega</span>
          <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Endereço, número, bairro e complemento" />
        </label>
      )}
      <label className="form-control client-picker-control">
        <span>Observação da entrega</span>
        <input value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} placeholder={deliveryType === "ENTREGA" ? "Ex.: tocar campainha" : "Ex.: cliente retira no balcão"} />
      </label>
    </>
  );
}
