export interface ItemLeyenda {
  icono: string;
  etiqueta: string;
}

/** Fila compacta que explica qué significa cada ícono de acción en la
 * pantalla — los botones de la lista van sin texto (solo ícono), así que
 * esto es lo que permite entender qué hace cada uno de un vistazo. */
export function LeyendaAcciones({ items }: { items: ItemLeyenda[] }) {
  return (
    <p className="leyenda-acciones">
      {items.map((item) => (
        <span key={item.icono}>
          <i className={`bi ${item.icono}`} aria-hidden="true" /> {item.etiqueta}
        </span>
      ))}
    </p>
  );
}
