import { formatNumber } from "../../../utils/formatters";
import { PointOfSaleClientPicker } from "./PointOfSaleClientPicker";
import { PointOfSaleDeliveryFields } from "./PointOfSaleDeliveryFields";
import { PointOfSaleDiscountControl } from "./PointOfSaleDiscountControl";
import { PointOfSaleProductPicker } from "./PointOfSaleProductPicker";
import { PointOfSalePrioritySelect } from "./PointOfSalePrioritySelect";
import { PointOfSaleQuoteFields } from "./PointOfSaleQuoteFields";

export function PointOfSaleCatalog({
  activeProducts,
  addProduct,
  addProductFromSearch,
  caixa,
  cashMode,
  clientSearch,
  clientSearchRef,
  deliveryAddress,
  deliveryNote,
  deliveryType,
  discount,
  discountAmount,
  discountMode,
  filteredClientes,
  filteredProducts,
  paymentMethod,
  priority,
  productSearch,
  productSearchRef,
  quoteConditions,
  quoteValidity,
  selectedClienteId,
  setClientSearch,
  setDeliveryAddress,
  setDeliveryNote,
  setDeliveryType,
  setDiscount,
  setDiscountAmount,
  setDiscountMode,
  setPaymentMethod,
  setPriority,
  setProductSearch,
  setQuoteConditions,
  setQuoteValidity,
  setSelectedClienteId,
}) {
  return (
    <article className="panel pos-panel">
      <div className="panel-title">
        <div>
          <h2>{cashMode ? "PDV do caixa" : "Nova venda"}</h2>
          <p>
            {cashMode
              ?
              "Venda direta no caixa. Para receber venda do vendedor, use a lista de pagamentos acima."
              : "Monte o pedido com cliente, forma de pagamento e desconto para o caixa receber."}
          </p>
        </div>
        <span>{cashMode && caixa ? `Caixa ${caixa.status}` : `${formatNumber(activeProducts.length)} produtos`}</span>
      </div>

      <div className="pos-form-grid">
        <PointOfSaleClientPicker
          cashMode={cashMode}
          clientSearch={clientSearch}
          clientSearchRef={clientSearchRef}
          filteredClientes={filteredClientes}
          selectedClienteId={selectedClienteId}
          setClientSearch={setClientSearch}
          setSelectedClienteId={setSelectedClienteId}
        />

        {!cashMode && (
          <PointOfSalePrioritySelect
            priority={priority}
            setPriority={setPriority}
          />
        )}

        <PointOfSaleDeliveryFields
          deliveryAddress={deliveryAddress}
          deliveryNote={deliveryNote}
          deliveryType={deliveryType}
          setDeliveryAddress={setDeliveryAddress}
          setDeliveryNote={setDeliveryNote}
          setDeliveryType={setDeliveryType}
        />

        <PointOfSaleDiscountControl
          discount={discount}
          discountAmount={discountAmount}
          discountMode={discountMode}
          setDiscount={setDiscount}
          setDiscountAmount={setDiscountAmount}
          setDiscountMode={setDiscountMode}
        />

        {!cashMode && (
          <PointOfSaleQuoteFields
            paymentMethod={paymentMethod}
            quoteConditions={quoteConditions}
            quoteValidity={quoteValidity}
            setPaymentMethod={setPaymentMethod}
            setQuoteConditions={setQuoteConditions}
            setQuoteValidity={setQuoteValidity}
          />
        )}
      </div>

      <PointOfSaleProductPicker
        addProduct={addProduct}
        addProductFromSearch={addProductFromSearch}
        cashMode={cashMode}
        filteredProducts={filteredProducts}
        productSearch={productSearch}
        productSearchRef={productSearchRef}
        setProductSearch={setProductSearch}
      />
    </article>
  );
}
